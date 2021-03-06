import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators, UserList} from 'components/userList';
import { push } from 'react-router-redux';

@connect(state => ({userList: state.userList}), mapDispatchToProps)
class UserListView extends Component {
    render() {
        return <UserList {...this.props}/>;
    }
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators({...actionCreators, push}, dispatch) };
}

export default UserListView;
