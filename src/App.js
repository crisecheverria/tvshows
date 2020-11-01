import React, { useState } from "react"
import CssBaseline from "@material-ui/core/CssBaseline"
import AppBar from "@material-ui/core/AppBar"
import { makeStyles } from "@material-ui/core/styles"
import TvIcon from "@material-ui/icons/Tv"
import Typography from "@material-ui/core/Typography"
import Toolbar from "@material-ui/core/Toolbar"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import Container from "@material-ui/core/Container"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import CircularProgress from "@material-ui/core/CircularProgress"

async function fetchEpisodes({ imdbID }) {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?i=${imdbID}&plot=short&r=json&apikey=a7da74f5`
    )
    const data = res.json()
    return Promise.resolve(data)
  } catch (error) {
    return Promise.reject(new Error("Oops!"))
  }
}

async function fetchRuntime(data) {
  return Promise.all(data.map((episode) => fetchEpisodes(episode)))
}

function mostUsedWord(str, Title) {
  const words = str.match(/\w+/g)

  let result = []
  let best = -1
  const lookup = {}
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i]
    if (lookup[word] === undefined) {
      lookup[word] = 0
    }
    lookup[word] += 1
    if (lookup[word] > best) {
      result = [word]
      best = lookup[word]
    } else if (lookup[word] === best) {
      result.push(word)
      best = lookup[word]
    }
  }

  return { words: result, num: best, title: Title }
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  form: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    margin: theme.spacing(5, 0),
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    flexGrow: 1,
  },
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    color: "green",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  errorMsg: {
    padding: theme.spacing(2, 10),
    color: "red",
  },
  boldText: {
    fontWeight: "bold",
  },
}))

function App() {
  const [show, setShow] = useState({
    title: "",
    season: "",
    avgRaiting: 0,
    data: [],
    runtime: "0",
    mostFrequentWord: "",
    episodeTitle: "",
    error: "",
  })
  const [loading, setLoading] = useState(false)
  const classes = useStyles()

  function handleChange(event) {
    setShow({
      ...show,
      [event.target.name]: event.target.value,
    })
  }

  async function fetchTvShow() {
    try {
      setLoading(true)
      const { title, season } = show
      const tvShows = await fetch(
        `https://www.omdbapi.com/?t=${title}&Season=${season}&apikey=a7da74f5`
      )
      const response = await tvShows.json()

      if (response.Response === "False") {
        setLoading(false)
        setShow({
          ...show,
          avgRaiting: 0,
          data: [],
          runtime: "",
          error: response.Error,
          mostFrequentWord: "",
          episodeTitle: "",
        })
        return
      }

      const averageRating =
        response.Episodes.reduce((prev, curr) => {
          return parseFloat(prev) + parseFloat(curr.imdbRating)
        }, 0) / response.Episodes.length
      const episodesInformation = await fetchRuntime(response.Episodes)
      const totalRuntime = episodesInformation.reduce((prev, curr) => {
        return prev + +curr.Runtime.replace(/\D/g, "")
      }, 0)

      const mostUsedWordPerPlot = episodesInformation
        .map(({ Title, Plot }) => mostUsedWord(Plot, Title))
        .sort((a, b) => a.num - b.num)

      let mostFrequentWord = []
      let best = -1
      const lookup = {}
      let episodeTitle = []
      let num = 0

      for (let i = 0; i < mostUsedWordPerPlot.length; i += 1) {
        const { words } = mostUsedWordPerPlot[i]
        num = mostUsedWordPerPlot[i].num
        const { title: episode } = mostUsedWordPerPlot[i]
        if (words.length > 1) {
          for (let j = 0; j < words.length; j += 1) {
            const word = words[j]
            if (lookup[word] === undefined) {
              lookup[word] = 0
            }
            lookup[word] += num
            if (lookup[word] > best) {
              mostFrequentWord = [word]
              episodeTitle = [episode]
              best = lookup[word]
            } else if (lookup[word] === best) {
              mostFrequentWord.push(word)
              episodeTitle.push(episode)
              best = lookup[word]
            }
          }
        }

        if (lookup[words] === undefined) {
          lookup[words] = 0
        }
        lookup[words] += num
        if (lookup[words] > best) {
          mostFrequentWord = [words]
          episodeTitle = [episode]
          best = lookup[words]
        } else if (lookup[words] === best) {
          mostFrequentWord.push(words)
          episodeTitle.push(episode)
          best = lookup[words]
        }
      }

      setShow((prevState) => ({
        ...prevState,
        avgRaiting: Math.round((averageRating + Number.EPSILON) * 100) / 100,
        data: response,
        runtime: `${totalRuntime} min`,
        mostFrequentWord,
        episodeTitle,
        error: "",
      }))
    } catch (error) {
      // eslint-disable-next-line
      console.log(error)
    }
    setLoading(false)
  }

  function validate() {
    const { title, season } = show
    return title !== "" && title.length > 0 && season > 0
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <TvIcon className={classes.icon} />
          <Typography variant="h6" color="inherit" noWrap>
            Analysing a TV show
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Container className={classes.cardGrid} maxWidth="md">
          <Grid container spacing={4} justify="center" alignItems="center">
            <Grid item key={1} xs={12} sm={6} md={8}>
              <form className={classes.form} noValidate autoComplete="off">
                <TextField
                  name="title"
                  label="Tv show name"
                  value={show.title}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleChange}
                />
                <TextField
                  name="season"
                  type="Number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  label="Season"
                  value={show.season}
                  onChange={handleChange}
                />
                <div className={classes.wrapper}>
                  <Button
                    variant="contained"
                    color="default"
                    disabled={!validate()}
                    onClick={fetchTvShow}
                  >
                    Search
                  </Button>
                  {loading && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              </form>
              {show.error && (
                <Typography className={classes.errorMsg}>
                  {show.error}
                </Typography>
              )}
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <Typography>Average rating:</Typography>
                  <Typography className={classes.boldText}>
                    {show.avgRaiting}
                  </Typography>
                  <Typography>
                    Total runtine of the season in minutes:
                  </Typography>
                  <Typography className={classes.boldText}>
                    {show.runtime ? show.runtime : "0 min"}
                  </Typography>
                  <Typography>
                    Most frequent word in Plot text from the episodes:
                  </Typography>
                  <Typography className={classes.boldText}>
                    {show.mostFrequentWord ? show.mostFrequentWord : "?"}
                  </Typography>
                  <Typography>
                    Episode Title with most occurrences of the most frequent
                    word:
                  </Typography>
                  <Typography className={classes.boldText}>
                    {show.episodeTitle ? show.episodeTitle : "?"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  )
}

export default App
