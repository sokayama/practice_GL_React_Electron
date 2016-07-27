

import React  from 'react';
import Flux   from 'flux';
import Action from '../actions/appAction.js';
import Store  from '../stores/appStore.js';

export default class RobotArmApp extends React.Component {
    constructor(props){
        super(props);

        //create instance : dispatcher,action,store
        var dispatcher = new Flux.Dispatcher;
        this.action = new Action({dispatcher: dispatcher, props:props});
        this.store = new Store ({dispatcher: dispatcher, props:props})

        //canvas情報
        this.canvasWidth = this.store.getCanvasInfo().width;
        this.canvasHeight = this.store.getCanvasInfo().height;
        
        //sliderの情報を取得
        //state. storeから初期値を取得する
        this.state = {
            slider: this.store.getSliderInfo()
        };

        //listen from store's emit
        this.store.on(Store.UPDATE_SLIDER,function(err, storeSlider){
            this.setState({slider : storeSlider});
        }.bind(this))

        //bind function
        this.sliderChange = this.sliderChange.bind(this);
    }
    
    styles(){
        return{

        }
    }

    //private関数
    //actionに値を送ったりする
    sliderChange(eve){
        this.action.updateSlider(eve.currentTarget.id,eve.currentTarget.value);
    }

    render(){
        const style = this.styles();
        return (

            <div>
                <canvas id="canvas" width={this.canvasWidth} height={this.canvasHeight}></canvas>
                <p>根元関節<br />
                    <input id={this.state.slider[0].id} type="range" onChange={this.sliderChange.bind(this)} value={this.state.slider[0].value} min={this.state.slider[0].min} max={this.state.slider[0].max} step={this.state.slider[0].step} /><br />
                    <input id={this.state.slider[1].id} type="range" onChange={this.sliderChange.bind(this)} value={this.state.slider[1].value} min={this.state.slider[1].min} max={this.state.slider[1].max} step={this.state.slider[1].step}  /><br />
                </p>
                <br />
                <p>中央関節<br />
                    <input id={this.state.slider[2].id} type="range" onChange={this.sliderChange.bind(this)} value={this.state.slider[2].value} min={this.state.slider[2].min} max={this.state.slider[2].max} step={this.state.slider[2].step} /><br />
                    <input id={this.state.slider[3].id} type="range" onChange={this.sliderChange.bind(this)} value={this.state.slider[3].value} min={this.state.slider[3].min} max={this.state.slider[3].max} step={this.state.slider[3].step} /><br />
                </p>
                <p>
                    <textarea id="ip_box" rows="10" cols="10" readOnly></textarea>
                </p>
            </div>
        );
    }
} 