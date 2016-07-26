// ============================================================================
// store
// ============================================================================

import EventEmitter from 'eventemitter3'

export default class Store extends EventEmitter {
    constructor(props){
        super(props);
        
        this.slider = [];
        this.slider.push(new SliderStrict({
            id: "slider0",
            min: "-2.7",
            max: "2.7",
            step: "0.01",
            value: "0"
        }))
        this.slider.push(new SliderStrict({
            id: "slider1",
            min: "-3.14",
            max: "3.14",
            step: "0.01",
            value: "0"
        }))
        this.slider.push(new SliderStrict({
            id: "slider2",
            min: "-2.7",
            max: "2.7",
            step: "0.01",
            value: "0"
        }))
        this.slider.push(new SliderStrict({
            id: "slider3",
            min: "-3.14",
            max: "3.14",
            step: "0.01",
            value: "0"
        }))
        
        
        //actionでdispatchに与えられたオブジェクトが
        //ここでpayloadとして取得される
        //storeを更新した後にEmitしてビューへ送る
        this.dispatcher = props.dispatcher;
        this.dispatcher.register((payload)=>{
            if(payload.actionType === "update_slider"){
                console.log(payload);
                for(let i=0;i<this.slider.length;i++){
                    if(this.slider[i].id === payload.id){
                        this.slider[i].value = payload.value;
                    }
                }
                this.emit(Store.UPDATE_SLIDER,null,this.slider)
            }
        });
    }

    getSliderInfo(){
        return this.slider;
    }
}

Store.UPDATE_SLIDER = "update_slider";

class SliderStrict{
    constructor(props){
        this.id = props.id;
        this.value = props.value;
        this.min = props.min;
        this.max = props.max;
        this.step = props.step;
        this.value = props.value;
    }
}
