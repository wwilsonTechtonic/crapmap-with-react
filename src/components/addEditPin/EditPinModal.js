import React, { Component } from 'react'
import firebase from './../../firebase'
import LineDivider from './LineDivider'
import CategoryButtons from '../buttons/CategoryButtons'
import BoxButtons from '../buttons/BoxButtons.js'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import ImageButton from '../buttons/ImageButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import store from '../../redux/store/index';
import { updatePin } from '../../redux/actions/pinActions';
import InputAdornment from '@material-ui/core/InputAdornment'
import Arrow from '../assets/crapmap-locator.png'
import Tooltip from '@material-ui/core/Tooltip'
class EditPinModal extends Component {
    constructor(props) {
        super(props);
        this.state = {

            category: this.props.incomeVal._fieldsProto.category.stringValue,
            img: this.props.incomeVal._fieldsProto.img.stringValue,
            location: this.props.incomeVal._fieldsProto.location.mapValue.fields.address.stringValue,
            lat: this.props.incomeVal._fieldsProto.location.mapValue.fields.lat.doubleValue,
            lng: this.props.incomeVal._fieldsProto.location.mapValue.fields.lng.doubleValue,
            size: this.props.incomeVal._fieldsProto.size.stringValue,
            title: this.props.incomeVal._fieldsProto.title.stringValue,
            userID: this.props.incomeVal._fieldsProto.userID.stringValue,
            locationPlaceHolder: "Where that crap at?",
            titlePlaceHolder:"Name your crap",
            titleLabel:"Title",
            locationLabel:"Location:",
            titleError: false,
            locationError: false,
            locationInputValid: "required"
        }
        this._changeCategory = this._changeCategory.bind(this);
    }

    handleClickOpen = scroll => () => {
        this.setState({ open: true, scroll });
    };

    handleClose = () => {
       this.props.onClick();
       this.props.reRenderModal();
    };

    _handleImg(img){
        this.setState({
            dataURL: img,
        })
    }

    async _uploadImg(){
        if(this.state.dataURL){
            return new Promise((resolve, reject) => {
                let storage = firebase.storage();
                let firebaseImageUrl = storage.ref(`pinsImages/${new Date().getTime()}`).put(this.state.dataURL).then((snapshot) => {
                    this.setState({fireBaseStorageFullUrl: snapshot.metadata.fullPath });
                    return(snapshot.metadata.fullPath);
                })
                firebaseImageUrl ? resolve(firebaseImageUrl) : reject(false)
             })
        }
    }

    _changeCategory(category) {
        switch (category) {
            case "Auto Parts":
                this.setState({ category: 'Auto Parts' });
                break;
            case "Sports":
                this.setState({ category: "Sports" });
                break;
            case "Gadgets":
                this.setState({ category: "Electronics" });
                break;
            case "question-circle":
                this.setState({ category: "Misc" });
                break;
            default:
                this.setState({ category: "Furniture" });
        }
    }

    handleTitleChange = (e) => {
        this.setState({
            title: e.target.value,
            titleError: false,
            titleLabel:"Title"
        })
    }

    handleLocationChange = (e) =>{
        this.setState({
            location: e.target.value,
            locationError: false,
            locationLabel:"Location:"
        })
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        if(this._formValid()){

            let userID;

            if (store.getState().user.userID){
                userID = store.getState().user.userID;
            } else {
                userID = JSON.parse(localStorage.getItem('userID'));
            }
            this._uploadImg().then( () => {
                    let pin = {
                        title: this.state.title,
                        lat: this.state.lat,
                        lng: this.state.lng,
                        address: this.state.location,
                        category: this.state.category,
                        img: this.state.fireBaseStorageFullUrl,
                        size: this.state.size,
                        userID: userID
                    }
                    let pinID = this.props.incomeVal._ref._path.segments[1];
                    store.dispatch(updatePin(pin, pinID));
                    this.props.fireUpdatePins();
                    this.handleClose();
                }
            ).catch( err => console.log(err));
        }else{
            return false
        }
    }

    _getCurrentLocation = async() =>{
        if(navigator.geolocation){
         navigator.geolocation.getCurrentPosition((position) => {

            let coordObject = {
                lat:  position.coords.latitude.toString(),
                lng: position.coords.longitude.toString()
            }

            fetch('https://us-central1-crapmap-c5c7f.cloudfunctions.net/api/map/reverse-geo-code',{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(coordObject),
            })
            .then(response => response.json())
            .then( data =>{

                if(data.status === "OK"){
                    let address = data.results[0].formatted_address; 
                    this.setState({
                        location: address,
                        lat:  position.coords.latitude,
                        lng: position.coords.longitude,
                        locationError: false,
                        locationLabel:"Location:"
                    })
                }
            }).catch();

         });
        }else{
            console.log('geolocation not availiable');
        }
    }

    _boxSize(value){
        this.setState({
            size: value
        })
    }

    _formValid(){
        if(!this.state.location || !this.state.title){
            if(!this.state.location)
            {
                this.setState({
                    locationLabel: "Error: Need Location",
                   locationError: "false"
                })
            }
            if(!this.state.title)
            {
                this.setState({
                    titleLabel: "Error: Need Tittle",
                   titleError: "false"
                })
            }
            return false;
        }else{
            return true;
        }
    }

    render() {
        return (
            <div>

                <Tooltip title="Edit This Crap">
                    <IconButton style={{fontSize: 20, marginLeft: 10, marginBottom: 8}}onClick={this.handleClickOpen('paper')}>
                        <FontAwesomeIcon icon="pencil-alt" />
                    </IconButton>
                </Tooltip>

                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    scroll={this.state.scroll}
                    aria-labelledby="scroll-dialog-title"
                    style={{'z-index': 30, 'background-color': 'primary'}}
                    className="edit-pin-mdl"
                >
                    <DialogTitle >
                        EDIT YOUR CRAP
                    </DialogTitle>
                    <LineDivider />
                    <DialogContent>
                        <form onSubmit={this.handleSubmit}>
                            <CategoryButtons  sendValue={this._changeCategory} value={this.state.category} />
                            <TextField
                                error={this.state.titleError}
                                id="outlined-name"
                                label={this.state.titleLabel}
                                className="pinTitle"
                                value={this.state.title}
                                onChange={this.handleTitleChange}
                                margin="normal"
                                variant="outlined"
                                placeholder= {this.state.titlePlaceHolder}
                            />
                            <TextField
                                InputProps={{
                                    readOnly: true,
                                  }}
                                id="outlined-name"
                                error={this.state.locationError}
                                label={this.state.locationLabel}
                                className="pinLocation"
                                value={this.state.location}
                                ref="locationInput"
                                onChange={this.handleLocationChange}
                                margin="normal"
                                variant="outlined"
                                placeholder={this.state.locationPlaceHolder}
                                defaultValue="Hit Arrow 4 Location"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={this._getCurrentLocation} >
                                                <img class="marker-style" src={Arrow} style={{ width: 30, height: 30, marginRight: -10 }}></img>
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <BoxButtons sendValue={this._boxSize.bind(this)} value={this.state.size} />
                            <ImageButton sendData={this._handleImg.bind(this)}/>
                            <LineDivider />
                        </form>
                    </DialogContent>
                    <DialogActions>

                        <Tooltip title="Save This Crap">
                            <Button onClick={this.handleSubmit} color="primary">POST</Button>
                        </Tooltip>
                        <Tooltip title="Nevermind">
                            <Button onClick={this.handleClose} color="error">CANCEL</Button>
                        </Tooltip>

                    </DialogActions>
                </Dialog>

            </div> 
        )
    }
}

EditPinModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    show: PropTypes.bool,
    children: PropTypes.node
};

export default EditPinModal