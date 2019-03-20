import React, { Component } from 'react'
import {connect} from 'react-redux';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const styles = {
  card: {
    maxWidth: 345,
    
  },
  media: {
    height: 140,
  }
};




function CardModal(props, data) {
    // console.log("insideprops", data)
    const { classes } = props;
  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Contemplative Reptile"
          className={classes.media}
          height="250"
          image="../assets/oldcouch.jpg"
          title="Contemplative Reptile"
        />

        <CardContent>

          <Typography gutterBottom variant="h5" component="h2">
            {/* {data.title} */}
          </Typography>

          <Typography component="p">
            {/* {data.location} */}
          </Typography>
    
        </CardContent>
  
      </CardActionArea>
      <CardActions>
        <Button size="medium" color="primary">
          Dibs
        </Button>
        <Button size="medium" color="primary">
          Pass
        </Button>
      </CardActions>
    </Card>
  );
}

export default connect(mapStateToProps)(withStyles(styles)(CardModal));

CardModal.propTypes = {
    classes: PropTypes.object.isRequired,
  };

  function mapStateToProps(reduxState){
    return {
      user: reduxState.user,
      pins: reduxState.pins
    }
  }