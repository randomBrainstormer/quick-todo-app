import React, { Component } from 'react';
import { ListItem, List, ListItemText, Grid, Button,
  Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, TextField, 
  ListItemIcon, ListItemSecondaryAction, Icon, IconButton} from 'material-ui';
import AddIcon from 'material-ui-icons/Add';
import { Link } from 'react-router-dom'; 
import { connect } from 'react-redux';
import AppHeader from './Header';
import './DashboardPage.css';

class DashboardPage extends Component {
  state = {
    open: false,
    listName: '',
    inputBeingUpdated: false,
    listId: null
  };

  componentDidMount(){
    this.props.getListsAction(this.props.userId);
  }

  // Apertura del modal
  handleClickOpen = () => {
    this.setState({ open: true });
  };

  // Chiusura del modal
  handleClose = () => {
    this.setState({ open: false, listName: '', inputBeingUpdated: false, listId: null });
  };

  handleAddList = (event) => {
    event.preventDefault();
    
    const data = new FormData(event.target);
    data.append('userId', this.props.userId);
    
    if (this.state.inputBeingUpdated) {
      data.append('id', this.state.listId);
      this.props.editListAction(data);
    } else {
      this.props.addListAction(data);
    }

    // chiudere la modal
    this.handleClose();
  }

  updateNameInput = (event) => {
    this.setState({ listName: event.target.value });
  }

  handleEdit = (event) => {
    const id = event.target.getAttribute('data-id');
    const name = event.target.getAttribute('data-name');
    if (name) {
      this.setState({ open: true, listName: name, listId: id, inputBeingUpdated: true });
    }
  }
  
  handleDelete = (event) => {
    const id = event.target.getAttribute('data-id');
    this.props.deleteListAction({ userId: this.props.userId, listId: id });
  }

  render() {
    return (
      <div className="DashboardPage">
        <AppHeader />
        <List component="nav">
        </List>
        {
          this.props.lists.map((list, i) => (            
              <ListItem className="DashboardPage-list" key={list.id} button>
                <ListItemIcon>
                  <Icon>list</Icon>
                </ListItemIcon>
                <Link key={list.id} to={`/list/${list.id}`} className="DashboardPage-list-link" >
                  <ListItemText primary={list.name} />
                </Link>
                <ListItemSecondaryAction data-id={list.id} data-name={list.name}>
                  <IconButton aria-label="Edit" className="editIcon" data-id={list.id} data-name={list.name} onClick={this.handleEdit}>
                    <Icon data-id={list.id} data-name={list.name}>edit</Icon>
                  </IconButton>
                  <IconButton aria-label="Delete" className="deleteIcon" data-id={list.id} onClick={this.handleDelete}>
                    <Icon data-id={list.id}>delete</Icon>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
          ))
        }
        <Grid container wrap="wrap" spacing={16}>
          <Grid item xs>
            <Button variant="fab" color="primary" aria-label="add" className="" onClick={this.handleClickOpen}>
              <AddIcon />
            </Button>
          </Grid>
        </Grid>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <form onSubmit={this.handleAddList}>
            <DialogTitle id="form-dialog-title">Inserisci nome lista</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Inserisci un nome per la tua lista
              </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="list-name"
                  name="name"
                  label="Nome Lista"
                  value={this.state.listName}
                  onChange={this.updateNameInput} 
                  fullWidth
                />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                { this.state.inputBeingUpdated ? 'Aggiorna' : 'Crea'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userId: state.login.user.id,
  lists: state.lists.lists
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  addListAction: data => {
    fetch('/api/add-list', { method: 'POST', body: data })
    .then(res => res.json())
    .then(json => {
      if (json.length > 0) {
        dispatch({ type: 'LISTS_ADD_SUCCESS', list: json[0] });
      }
      else {
        dispatch({ type: 'REQUEST_FAILURE', json });
      }
    })
    .catch(error => dispatch({ type: 'LIST_ADD_FAILURE', error }));
  },
  editListAction: data => {
    fetch('/api/update-list', { method: 'POST', body: data })
    .then(res => res.json())
    .then(json => {
      if (json.length > 0) {
        dispatch({ type: 'LISTS_EDIT_SUCCESS', list: json[0] });
      }
      else {
        dispatch({ type: 'REQUEST_FAILURE', json });
      }
    })
    .catch(error => dispatch({ type: 'LIST_ADD_FAILURE', error }));
  },
  getListsAction: userId => {
    fetch(`/api/lists?userId=${userId}`)
    .then(res => res.json())
    .then(json => dispatch({ type: 'LISTS_UPDATE_SUCCESS', lists: json }))
    .catch(error => dispatch({ type: 'REQUEST_FAILURE', error }));
  },
  deleteListAction: list => {
    fetch(`/api/deleteList?userId=${list.userId}&listId=${list.listId}`, { method: 'delete'})
    .then(json => dispatch({ type: 'LISTS_DELETE_SUCCESS', id:list.listId }))
    .catch(error => dispatch({ type: 'REQUEST_FAILURE', error }));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
 )(DashboardPage);