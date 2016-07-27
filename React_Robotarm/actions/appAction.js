// ============================================================================
// action
// ============================================================================

export default class Action{
    constructor(props){
        this.dispatcher = props.dispatcher;

    }
    //dispatchへ与えたオブジェクトが
    //storeのdispatcher.registerに登録された関数へ
    //payloadに渡される
    updateSlider(id,value){
        this.dispatcher.dispatch({
            actionType: "update_slider",
            id: id,
            value: value
        })
    }
}


