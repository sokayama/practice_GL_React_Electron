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
        
        //canvas情報
        this.canvas = new CanvasStruct({
            width: 512,
            height: 512
        });

        this.ipbox = new IPBoxStruct({
            id: "ipbox",
            value: "",
            rows: 10,
            cols: 10
        });
        
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
            }else if(payload.actionType === "update_ipbox"){
                this.ipbox.value = payload.value;
                this.emit(Store.UPDATE_IPBOX,null,this.ipbox)
            }
        });
    }

    getSliderInfo(){
        return this.slider;
    }
    getIPBoxInfo(){
        return this.ipbox;
    }
    getCanvasInfo(){;
        return this.canvas
    }
}

Store.UPDATE_SLIDER = "update_slider";
Store.UPDATE_IPBOX = "update_ipbox"

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
class CanvasStruct{
    constructor(props){
        this.width = props.width;
        this.height = props.height;
    }
}

class IPBoxStruct{
    constructor(props){
        this.id = props.id;
        this.value = props.value;
        this.rows = props.rows;
        this.cols = props.cols;
    }
}