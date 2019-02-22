import React, { Component } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Button, Modal, Alert, PanResponder } from 'react-native';
import { Card, Icon, Rating, AirbnbRating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import { Icon as IconC } from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
};

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (comment) => dispatch(postComment(comment))
});

function RenderDish(props){
    const dish = props.dish;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
            {
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );                
            }

            return true;
        }
    })

    if(null != dish){
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
            {...panResponder.panHandlers}
            >
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Icon
                            raised
                            reverse
                            name={ props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                            />
                        <Icon
                            raised
                            reverse
                            name='comment'
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.onPressComment()}
                            />                 
                    </View>                   
                </Card>            
            </Animatable.View>
        );
    }
    else{
        return (<View></View>);
    }
}

function RenderComments(props){
    const comments = props.comments;

    const renderCommentItem = ({item, index}) => {
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating
                    imageSize={20}
                    readonly
                    startingValue={item.rating}
                    style={ styles.rating }
                    />               
                <Text style={{fontSize: 12}}>{'-- '+ item.author + '. ' + item.date}</Text>                
            </View>
        );
    }

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title="Comments">
                <FlatList data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()} />
            </Card>        
        </Animatable.View>        
    );
}

class Dishdetail extends Component{

    constructor(props){
        super(props);
        this.state = {
            showModal: false,
            rating: 1,
            author: '',
            comment: '',
            date: ''        
        };
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }    

    openCommentModal() {
        console.log(JSON.stringify(this.state));
        this.toggleModal();
    }    

    resetForm() {
        this.setState({
            showModal: false,
            rating: 1,
            author: '',
            comment: '',
            date: ''    
        });
    }

    markFavorite(dishId) {
        // this.setState({favorites: this.state.favorites.concat(dishId)});
        this.props.postFavorite(dishId);
    }

    handleComment(dishId){

        console.log(JSON.stringify(this.state));
        this.toggleModal();

        this.props.postComment({dishId: dishId, author: this.state.author, rating: this.state.rating, comment: this.state.comment, date: (new Date().toISOString())});
    }

    ratingCompleted(rating) {
        console.log("Rating is: " + rating)
    }    

    static navigationOptions = {
        title: 'Dish Details'
    };

    render(){
        const dishId = this.props.navigation.getParam('dishId', '');
        return (
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    onPressComment = {() => this.openCommentModal()} 
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
            
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => {this.toggleModal(); this.resetForm();} }
                    onRequestClose = {() => {this.toggleModal(); this.resetForm();} }>
                    <View style = {styles.modal}>
                        <Text style = {styles.modalTitle}>Your Rating</Text>
                        <Rating
                            showRating
                            ratingCount={5}
                            onFinishRating={(value) => this.setState({rating: value})}
                            style={{ paddingVertical: 10 }}
                        />
                        <Input
                            placeholder='INPUT WITH CUSTOM ICON'
                            leftIcon={
                            <Icon
                                name='user'
                                size={24}
                                color='black'
                            />
                            }
                            onChangeText={(value) => this.setState({author: value})}
                        />  
                        <Input
                            placeholder='INPUT WITH CUSTOM ICON'
                            leftIcon={
                            <Icon
                                name='comment'
                                size={24}
                                color='black'
                            />
                            }
                            onChangeText={(value) => this.setState({comment: value})}
                        />       
                        <Button 
                            onPress = {() =>{this.handleComment(dishId)}}
                            // color="#512DA8"
                            title="Submit" 
                            />                                                      
                        <Button 
                            onPress = {() =>{this.toggleModal(); this.resetForm();}}
                            color="#512DA8"
                            title="Cancel" 
                            />
                    </View>
                </Modal>            
            </ScrollView>            
        );        
    }

}

const styles = StyleSheet.create({
    rating: {
        flex: 1,
        alignItems: 'flex-start'
    },
    modal: {
        justifyContent: 'center',
        margin: 20
     },
     modalTitle: {
         fontSize: 24,
         fontWeight: 'bold',
         backgroundColor: '#512DA8',
         textAlign: 'center',
         color: 'white',
         marginBottom: 20
     },
     modalText: {
         fontSize: 18,
         margin: 10
     }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);