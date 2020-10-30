import React, { useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import TvIcon from '@material-ui/icons/Tv';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function App() {
  const [show, setShow] = useState({
    title: '',
    season: '',
    avgRaiting: 0,
    data: []
  })
  const classes = useStyles();

  function handleChange(event) {
    setShow({
      ...show,
      [event.target.name]: event.target.value
    })
  }

  async function fetchTvShow() {
    const {title, season} = show
    const tvShows = await fetch(`https://www.omdbapi.com/?t=${title}&Season=${season}&apikey=a7da74f5`);
    const response = await tvShows.json()
    const ratings = response.Episodes.map(({ imdbRating }) => imdbRating);
    const averageRating = ratings.reduce((prev, curr) => {
        return parseFloat(prev) + parseFloat(curr)
    }, 0) / ratings.length;
    setShow((prevState) => ({
      ...prevState,
      avgRaiting: averageRating,
      data: response
    }))
  }

  console.log('Show: ', show)

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
                    name='title'
                    label="Tv show name" 
                    value={show.title}
                    InputLabelProps={{
                      shrink: true,
                    }}  
                    onChange={handleChange} 
                  />
                  <TextField 
                    name='season'
                    type="Number" 
                    InputLabelProps={{
                      shrink: true,
                    }} 
                    label="Season" 
                    value={show.season} 
                    onChange={handleChange} 
                  />
                  <Button variant="contained" color="primary" onClick={fetchTvShow}>
                    Search
                  </Button>
                </form>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <Typography>
                      Average Rating: {show.avgRaiting}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
          </Grid>
        </Container>
      </main>
      <footer className={classes.footer}>
        <Container maxWidth="sm">
          <Copyright />
        </Container>
      </footer>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  form: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: theme.spacing(10, 0),
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
  },
}));

export default App;
