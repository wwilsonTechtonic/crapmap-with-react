import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import EditPinModal from '../addEditPin/EditPinModal'
import Button from '@material-ui/core/Button'
import store from '../../redux/store';
import firebase from './../../firebase.js';

import {deletePin} from '../../redux/actions/pinActions'

const styles = {

};

class MyListingsPost extends Component{

  constructor(props){
    super(props)
    this.state={
      imageLoaded : false
    }
  }

  async _getPinsByUser(userID) {
    var userPins = await fetch(' https://us-central1-crapmap-c5c7f.cloudfunctions.net/api/pins/get/' + String(userID), {
    method: 'GET',
  })
    .then((res) => { return res.json()})
    .then((val) => { 
      return val})
    .catch((err) => err)
    return userPins;
  }

 async _getImgURL(){
    let imgUrls = {};
    for(let i = 0; i < this.state.userPins.length; i++){
        let storage = firebase.storage();
        let pinImgRef= this.state.userPins[i]._fieldsProto.img.stringValue;
        let storageRef = storage.ref(pinImgRef);
        let stateProp = `${pinImgRef}`
        imgUrls[stateProp] = await storageRef.getDownloadURL().then(function(url) {
          return url
        }).catch(function() {
          return './../assets/crapmapLogoWhite.png'
        });
    };

    this.setState({imgUrls});
    this.setState({imageLoaded : true});

    return false
  }

  handleDelete(e){
    e.target.parentNode.parentNode.parentNode.innerHTML = '';
  }

  async componentDidMount(){
    let userID = JSON.parse(localStorage.getItem('userID'));
    this.setState({userPins : await this._getPinsByUser(userID)});
    this._getImgURL();
   }

  async componentDidUpdate(prevProps,prevState){
    if (this.state.imageLoaded !== prevState.imageLoaded) {
      let userID = JSON.parse(localStorage.getItem('userID'));
      this.setState({
        userPins : await this._getPinsByUser(userID),
      });
      this._getImgURL();
    }
  }

  resetImageLoaded(){
    this.setState({
      imageLoaded: false
    })
  }

  render(){ 
    const { classes } = this.props;
    return (
    ( !this.state.imageLoaded ? <div> Loading </div> :
      this.props.userPins.map((pin) =>{ 
        let stateUrl = this.state.imgUrls[`${pin._fieldsProto.img.stringValue}`];
        return( <Card className={classes.card}>
          <CardActionArea>
            <CardMedia
              className={classes.media}
              title={'nothing'}
              height="140"
            />
            <CardContent>
              <img src={stateUrl} width="345"></img>
              <Typography gutterBottom variant="h5" component="h2">
                {pin._fieldsProto.title.stringValue}
            </Typography>
              <Typography component="p">
                {pin._fieldsProto.location.mapValue.fields.address.stringValue}
          </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions>
            <EditPinModal reRenderModal = {this.props._fireRenderModal} onClick = {this.resetImageLoaded.bind(this)} fireUpdatePins={this.props.fireUpdatePins} incomeVal={pin} />
            <Button color="error" style={{ left: 230, display: 'block' }} onClick={(e) => {
            store.dispatch(deletePin(pin._ref._path.segments[1]))
            this.handleDelete(e);
          }}>Delete</Button>
          </CardActions>
        </Card> 
     )
      }
    )))
  }
}

MyListingsPost.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyListingsPost);