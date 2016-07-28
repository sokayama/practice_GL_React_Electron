

import React  from 'react';
import Flux   from 'flux';
import Action from '../actions/appAction.js';
import Store  from '../stores/appStore.js';

import ReactDOM from "react-dom";

import io from "socket.io-client";

"use strict";

export default class RobotArmApp extends React.Component {
    constructor(props){
        super(props);
        //create instance : dispatcher,action,store
        var dispatcher = new Flux.Dispatcher;
        this.action = new Action({dispatcher: dispatcher, props:props});
        this.store = new Store ({dispatcher: dispatcher, props:props})

        this.socket = io.connect("http://192.168.1.89:8080");//connection開始

        //canvas情報
        this.canvasWidth = this.store.getCanvasInfo().width;
        this.canvasHeight = this.store.getCanvasInfo().height;
        this.c;

        //WebGL
        this.gl;
        this.vs;
        this.fs;
        this.textures = [];

        this.socket;

        this.myIPAddress;

        window.addEventListener("beforeunload",this.disconnectFunc,false);

        //sliderの情報を取得
        //state. storeから初期値を取得する
        this.state = {
            slider: this.store.getSliderInfo(),
            ipbox: this.store.getIPBoxInfo()
        };

        //listen from store's emit
        this.store.on(Store.UPDATE_SLIDER,function(err, storeSlider){
            this.setState({slider : storeSlider});
        }.bind(this))
        this.store.on(Store.UPDATE_IPBOX,function(err, storeIPBox){
            this.setState({ipbox : storeIPBox});
        }.bind(this))
        

        //bind function
        this.componentDidMount = this.componentDidMount.bind(this);
        this.disconnectFunc = this.disconnectFunc.bind(this);
        this.sliderChange = this.sliderChange.bind(this);
        this.sliderChangeSocket = this.sliderChangeSocket.bind(this);
        this.initWebGL = this.initWebGL.bind(this);
        this.create_texture = this.create_texture.bind(this);
        this.set_attribute = this.set_attribute.bind(this);
        this.create_ibo = this.create_ibo.bind(this);
        this.create_program = this.create_program.bind(this);
        this.create_shader = this.create_shader.bind(this);
        this.initialize = this.initialize.bind(this);
        this.create_vbo = this.create_vbo.bind(this);
    }
    
    styles(){
        return{

        }
    }

    sliderChange(eve){
        console.log("send :" + eve.currentTarget.id + " " + eve.currentTarget.value);
        switch(eve.currentTarget.id){
            case "slider0":
              this.socket.emit("send0",eve.currentTarget.value-0);
              break;
            case "slider1":
              this.socket.emit("send1",eve.currentTarget.value-0);
              break;
            case "slider2":
              this.socket.emit("send2",eve.currentTarget.value-0);
              break;
            case "slider3":
              this.socket.emit("send3",eve.currentTarget.value-0);
              break;
            default:
        }
        this.action.updateSlider(eve.currentTarget.id,eve.currentTarget.value-0);
        
    }
    sliderChangeSocket(id,value){
        this.action.updateSlider(id,value-0);
    }
    componentDidMount(){
        this.refs.canvas;
        this.c = ReactDOM.findDOMNode(this.refs.canvas);
        this.initWebGL();
    };
    disconnectFunc(){
        console.log("disconnect button" + this.myIPAddress)
        this.socket.emit("user_disconnected",this.myIPAddress);
        this.socket.disconnect();
    }

    render(){
        const style = this.styles();
        return (
            <div>
                <canvas id="canvas" width={this.canvasWidth} height={this.canvasHeight} ref="canvas"></canvas>
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
                    <textarea id={this.state.ipbox.id} value={this.state.ipbox.value} rows={this.state.ipbox.rows} cols={this.state.ipbox.cols} readOnly></textarea>
                </p>
                <input type="button" onClick={this.disconnectFunc} value="disconnect"></input>
            </div>
        );
    }


//main.jsからコピペ
//必要なものをべちゃべちゃ貼り付けてる。きたない

    initWebGL(){
        // - canvas と WebGL コンテキストの初期化 -------------------------------------

        // webglコンテキストを取得
        this.gl = this.c.getContext('webgl') || this.c.getContext('experimental-webgl');

        this.create_texture("./w089_03.jpg",0,this.initialize);
    }

    initialize(){


        // - シェーダとプログラムオブジェクトの初期化 ---------------------------------
        // シェーダのソースを取得
        const VERT = `
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec4 color;
            attribute vec2 texCoord;
            uniform   mat4 mvpMatrix;
            uniform mat4 invMatrix;
            uniform   vec3 lightDirection;
            uniform   mat4 invtransposeMatrix;
            uniform   mat4 mv_invtransposeMatrix;
            varying vec2 textureCoord;
            varying vec4 vColor;

            void main(){
                //vNormal = normal;
                vec2 temptexcoord = texCoord;//一応持ってるだけで使ってない

                //逆転置行列*法線でスフィア環境マップを作る
                textureCoord.st = ((mv_invtransposeMatrix * vec4(normal,0.0)).xy + 1.0) / 2.0;

                //光の計算(平行光)
                vec3 n = (invtransposeMatrix * vec4(normal,0.0)).xyz;	
                float dotNormal = max(dot(lightDirection,n),0.3);
                vColor = vec4(color.rgb * dotNormal, color.a);
                
                gl_Position = mvpMatrix * vec4(position, 1.0);
            }     
        `;

        const FRAG = `
            precision mediump float;
            uniform sampler2D texture;

            varying vec2 textureCoord;
            varying vec4 vColor;

            void main(){

                vec4 smpColor = texture2D(texture,textureCoord.st);

                gl_FragColor = smpColor * vColor;
            }
        `;
        
        this.vs = VERT;
        this.fs = FRAG;

        // 頂点シェーダとフラグメントシェーダの生成
        var vShader = this.create_shader(this.vs, this.gl.VERTEX_SHADER);
        var fShader = this.create_shader(this.fs, this.gl.FRAGMENT_SHADER);

        // プログラムオブジェクトの生成とリンク
        var prg = this.create_program(vShader, fShader);


        // - 頂点属性に関する処理 ----------------------------------------------------- *
        // attributeLocationの取得
        var attLocation = [];
        attLocation[0] = this.gl.getAttribLocation(prg, 'position');
        attLocation[1] = this.gl.getAttribLocation(prg, 'color');
        attLocation[2] = this.gl.getAttribLocation(prg, "normal");
        attLocation[3] = this.gl.getAttribLocation(prg,"texCoord");

        // attributeの要素数
        var attStride = [];
        attStride[0] = 3;
        attStride[1] = 4;
        attStride[2] = 3;
        attStride[3] = 2;

        var sizeHand = 2.0;
        var sizeJoint = 2.0;
        var sizeRoot = 3.0;
        var lengthArm = 10.0;
        var r_Arm = 1.0;

        var handData = createEarth(sizeHand,30);
        var jointData = createEarth(sizeJoint,30);
        var rootData = createEarth(sizeRoot,30);
        var arm1Data = createCylinder(lengthArm,10,r_Arm);
        var arm2Data = createCylinder(lengthArm,10,r_Arm);

        // VBOの生成
        var handVBO = [];
        handVBO[0] = this.create_vbo(handData.p);
        handVBO[1] = this.create_vbo(handData.c);
        handVBO[2] = this.create_vbo(handData.n);
        handVBO[3] = this.create_vbo(handData.t);


        var handIBO = this.create_ibo(handData.i_triangles);

        // VBOのバインドと登録
        this.set_attribute(handVBO, attLocation, attStride);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, handIBO);

        // VBOの生成
        var jointVBO = [];
        jointVBO[0] = this.create_vbo(jointData.p);
        jointVBO[1] = this.create_vbo(jointData.c);
        jointVBO[2] = this.create_vbo(jointData.n);
        jointVBO[3] = this.create_vbo(jointData.t);


        var jointIBO = this.create_ibo(jointData.i_triangles);

        // VBOのバインドと登録
        this.set_attribute(jointVBO, attLocation, attStride);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, jointIBO);

        // VBOの生成
        var rootVBO = [];
        rootVBO[0] = this.create_vbo(rootData.p);
        rootVBO[1] = this.create_vbo(rootData.c);
        rootVBO[2] = this.create_vbo(rootData.n);
        rootVBO[3] = this.create_vbo(rootData.t);


        var rootIBO = this.create_ibo(rootData.i_triangles);

        // VBOのバインドと登録
        this.set_attribute(rootVBO, attLocation, attStride);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, rootIBO);


        // VBOの生成
        var arm1VBO = [];
        arm1VBO[0] = this.create_vbo(arm1Data.p);
        arm1VBO[1] = this.create_vbo(arm1Data.c);
        arm1VBO[2] = this.create_vbo(arm1Data.n);
        arm1VBO[3] = this.create_vbo(arm1Data.t);

        var arm1IBO = this.create_ibo(arm1Data.i_triangles);

        // VBOのバインドと登録
        this.set_attribute(arm1VBO, attLocation, attStride);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, arm1IBO);

        // VBOの生成
        var arm2VBO = [];
        arm2VBO[0] = this.create_vbo(arm2Data.p);
        arm2VBO[1] = this.create_vbo(arm2Data.c);
        arm2VBO[2] = this.create_vbo(arm2Data.n);
        arm2VBO[3] = this.create_vbo(arm2Data.t);

        var arm2IBO = this.create_ibo(arm2Data.i_triangles);

        // VBOのバインドと登録
        this.set_attribute(arm2VBO, attLocation, attStride);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, arm2IBO);


        // - 行列の初期化 -------------------------------------------------------------
        // minMatrix.js を用いた行列関連処理
        // matIVオブジェクトを生成
        var m = new matIV();

        // 各種行列の生成と初期化
        var mHandMatrix = m.identity(m.create());
        var mJointMatrix = m.identity(m.create());
        var mRootMatrix = m.identity(m.create());
        var mArm1Matrix = m.identity(m.create());
        var mArm2Matrix = m.identity(m.create());

        var vMatrix = m.identity(m.create());
        var pMatrix = m.identity(m.create());
        var vpMatrix = m.identity(m.create());
        var mvMatrix = m.identity(m.create());
        var mvpMatrix = m.identity(m.create());
        var invMatrix = m.identity(m.create());
        var invtransposeMatrix = m.identity(m.create());
        var mv_invtransposeMatrix = m.identity(m.create());
        
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        
        var lightDirection = [0.577, 0.577, 0.577];





        //socket.io関係	
        var guestdata_list = [];
        var myIP = 0;


        this.socket.on("push0",function(push_data){//サーバーから受信
            // ele_slider1.value = push_data;
            // slider1 = push_data;
            this.sliderChangeSocket("slider0",push_data);
            console.log("receive slider0 push_data : " + push_data);
        }.bind(this));
        this.socket.on("push1",function(push_data){//サーバーから受信
            this.sliderChangeSocket("slider1",push_data);
            console.log("receive slider1 push_data : " + push_data);
        }.bind(this));
        this.socket.on("push2",function(push_data){//サーバーから受信
            this.sliderChangeSocket("slider2",push_data);
            console.log("receive slider2 push_data : " + push_data);
        }.bind(this));
        this.socket.on("push3",function(push_data){//サーバーから受信
            this.sliderChangeSocket("slider3",push_data);
            console.log("receive slider3 push_data : " + push_data);
        }.bind(this));

        this.socket.on("push_guest_list",function(push_data){//接続してる人たち
            guestdata_list = push_data;
            let ipbox_value = "";
            console.log("receive guestdata_list : " + push_data);
            //ele_ipbox.value = "";
            for(var i=0;i<guestdata_list.length;i++){
                ipbox_value += ("[" + guestdata_list[i] + "]\n");
            }
            this.action.updateIPBox(ipbox_value);//actionにipboxの中身送信
        }.bind(this));
        this.socket.on("push_guest",function(push_data){//自分のIPキープしとく
            this.myIPAddress = push_data;
            console.log("私のIDは" + this.myIPAddress)
        }.bind(this));
        this.socket.on("connect",function(){
        　//タイムアウトを5秒に設定する
        　//this.socket.headbeatTimeout = 5000;
        }.bind(this));

        //マウスドラッグでY軸回転
        var flgDrag = false;
        var startDrag = 0;
        var cameraRadXZ = 0;
        var resultCameraRadXZ = 0;
        this.c.addEventListener("mousemove",function(eve)
        {
            if(flgDrag === false){
                startDrag = eve.offsetX;
            }else{
                cameraRadXZ = resultCameraRadXZ + eve.offsetX - startDrag;
            }	
        },false);

        this.c.addEventListener("mouseup",function(eve){
            flgDrag = false;
            resultCameraRadXZ = cameraRadXZ;
        },false)
        this.c.addEventListener("mouseout",function(eve){
            flgDrag = false;
            resultCameraRadXZ = cameraRadXZ;
        },false)
        this.c.addEventListener("mousedown",function(eve){
            flgDrag = true;
        },false)

        var counter = 0;

        timerFunc = timerFunc.bind(this);
        timerFunc();
        function timerFunc()
        {

            counter++;

            // - レンダリングのための WebGL 初期化設定 ------------------------------------
            // ビューポートを設定する
            this.gl.viewport(0, 0, this.c.width, this.c.height);

            // canvasを初期化する色を設定する
            this.gl.clearColor(0.1, 0.7, 0.7, 1.0);

            // canvasを初期化する際の深度を設定する
            this.gl.clearDepth(1.0);

            // canvasを初期化
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            this.gl.enable(this.gl.DEPTH_TEST);

            // - 行列の計算 ---------------------------------------------------------------
            // ビュー座標変換行列
            var camera_x = Math.sin(cameraRadXZ/100);
            var camera_z = Math.cos(cameraRadXZ/100);
            //var camera_x = 1;
            //var camera_z = 1;
            var camera_pull = 50;

            m.lookAt([camera_x * camera_pull, 1.0, camera_z * camera_pull], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);

            // プロジェクション座標変換行列
            m.perspective(45, this.c.width / this.c.height, 0.1, 100.0, pMatrix);

            //mMatrix操作
            mArm1Matrix = m.identity(m.create());
            mArm2Matrix = m.identity(m.create());
            mHandMatrix = m.identity(m.create());
            mJointMatrix = m.identity(m.create());
            mRootMatrix = m.identity(m.create());

            var rotateArm1;
            m.rotate(mArm1Matrix,this.state.slider[1].value,[0.0,1.0,0.0],mArm1Matrix);
            m.rotate(mArm1Matrix,this.state.slider[0].value,[1.0,0.0,0.0],mArm1Matrix)

            m.translate(mArm1Matrix,[0.0,lengthArm,0.0],mArm2Matrix);
            m.rotate(mArm2Matrix,this.state.slider[3].value,[0.0,1.0,0.0],mArm2Matrix);
            m.rotate(mArm2Matrix,this.state.slider[2].value,[1.0,0.0,0.0],mArm2Matrix);

            m.translate(mArm1Matrix,[0.0,lengthArm,0.0],mJointMatrix);

            m.translate(mArm2Matrix,[0.0,lengthArm,0.0],mHandMatrix);


            // - uniform 関連の初期化と登録 -----------------------------------------------
            // uniformLocationの取得
            var uniLocation = [];
            uniLocation[0] = this.gl.getUniformLocation(prg, 'mvpMatrix');
            uniLocation[1] = this.gl.getUniformLocation(prg, 'invMatrix');
            uniLocation[2] = this.gl.getUniformLocation(prg, 'lightDirection');
            uniLocation[3] = this.gl.getUniformLocation(prg, "invtransposeMatrix");
            uniLocation[4] = this.gl.getUniformLocation(prg, "mv_invtransposeMatrix");
            
            var texLocation = this.gl.getUniformLocation(prg, "texture");


    // HAND
            // 各行列を掛け合わせ座標変換行列を完成させる
            
            m.multiply(pMatrix, vMatrix, vpMatrix);
            m.multiply(vpMatrix, mHandMatrix, mvpMatrix);

            m.multiply(vMatrix, mHandMatrix, mvMatrix);
            m.inverse(mvMatrix,invMatrix);
            m.transpose(invMatrix,mv_invtransposeMatrix);

            m.inverse(mHandMatrix, invMatrix);
            m.transpose(invMatrix,invtransposeMatrix);
            
            // = uniform 関連 ========================================================= *
            // uniformLocationへ座標変換行列を登録
            this.gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            this.gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            this.gl.uniform3fv(uniLocation[2], lightDirection);
            this.gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            this.gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)

            this.gl.uniform1i(texLocation,0);

            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            this.set_attribute(handVBO, attLocation, attStride);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, handIBO);
            this.gl.bindTexture(this.gl.TEXTURE_2D,this.textures[0]);
            this.gl.drawElements(this.gl.TRIANGLES, handData.i_triangles.length, this.gl.UNSIGNED_SHORT, 0);

            //vColor = vec4(color.rgb * dotNormal, color.a);
    // JOINT
            // 各行列を掛け合わせ座標変換行列を完成させる
            
            m.multiply(pMatrix, vMatrix, vpMatrix);
            m.multiply(vpMatrix, mJointMatrix, mvpMatrix);
            
            m.multiply(vMatrix, mJointMatrix, mvMatrix);
            m.inverse(mvMatrix,invMatrix);
            m.transpose(invMatrix,mv_invtransposeMatrix);

            m.inverse(mJointMatrix, invMatrix);
            m.transpose(invMatrix,invtransposeMatrix);
            
            // = uniform 関連 ========================================================= *
            // uniformLocationへ座標変換行列を登録
            this.gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            this.gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            this.gl.uniform3fv(uniLocation[2], lightDirection);
            this.gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            this.gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)

            //this.gl.uniform1i(texLocation,0);

            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            this.set_attribute(jointVBO, attLocation, attStride);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, handIBO);
            this.gl.bindTexture(this.gl.TEXTURE_2D,this.textures[0]);
            this.gl.drawElements(this.gl.TRIANGLES, jointData.i_triangles.length, this.gl.UNSIGNED_SHORT, 0);

            //vColor = vec4(color.rgb * dotNormal, color.a);
    // ROOT
            // 各行列を掛け合わせ座標変換行列を完成させる
            
            m.multiply(pMatrix, vMatrix, vpMatrix);
            m.multiply(vpMatrix, mRootMatrix, mvpMatrix);
            
            m.multiply(vMatrix, mRootMatrix, mvMatrix);
            m.inverse(mvMatrix,invMatrix);
            m.transpose(invMatrix,mv_invtransposeMatrix);

            m.inverse(mRootMatrix, invMatrix);
            m.transpose(invMatrix,invtransposeMatrix);
            
            // = uniform 関連 ========================================================= *
            // uniformLocationへ座標変換行列を登録
            this.gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            this.gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            this.gl.uniform3fv(uniLocation[2], lightDirection);
            this.gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            this.gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)

            //this.gl.uniform1i(texLocation,0);

            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            this.set_attribute(rootVBO, attLocation, attStride);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, rootIBO);
            this.gl.bindTexture(this.gl.TEXTURE_2D,this.textures[0]);
            this.gl.drawElements(this.gl.TRIANGLES, rootData.i_triangles.length, this.gl.UNSIGNED_SHORT, 0);

            //vColor = vec4(color.rgb * dotNormal, color.a);
    //ARM1
            // 各行列を掛け合わせ座標変換行列を完成させる
            m.multiply(pMatrix, vMatrix, vpMatrix);
            m.multiply(vpMatrix, mArm1Matrix, mvpMatrix);
            
            m.multiply(vMatrix, mArm1Matrix, mvMatrix);
            m.inverse(mvMatrix,invMatrix);
            m.transpose(invMatrix,mv_invtransposeMatrix);

            m.inverse(mArm1Matrix, invMatrix);
            m.transpose(invMatrix,invtransposeMatrix);
            
            // = uniform 関連 ========================================================= *

            // uniformLocationへ座標変換行列を登録
            this.gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            this.gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            this.gl.uniform3fv(uniLocation[2], lightDirection);
            this.gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            this.gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)
            //this.gl.uniform1i(texLocation,0);


            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            this.set_attribute(arm1VBO, attLocation, attStride);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, arm1IBO);
            this.gl.bindTexture(this.gl.TEXTURE_2D,this.textures[0]);
            this.gl.drawElements(this.gl.TRIANGLES, arm1Data.i_triangles.length, this.gl.UNSIGNED_SHORT, 0);

            
    //ARM2
            // 各行列を掛け合わせ座標変換行列を完成させる
            m.multiply(pMatrix, vMatrix, vpMatrix);
            m.multiply(vpMatrix, mArm2Matrix, mvpMatrix);
            
            m.multiply(vMatrix, mArm2Matrix, mvMatrix);
            m.inverse(mvMatrix,invMatrix);
            m.transpose(invMatrix,mv_invtransposeMatrix);

            m.inverse(mArm2Matrix, invMatrix);
            m.transpose(invMatrix,invtransposeMatrix);
            
            // = uniform 関連 ========================================================= *
            // uniformLocationへ座標変換行列を登録
            this.gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            this.gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            this.gl.uniform3fv(uniLocation[2], lightDirection);
            this.gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            this.gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)

            //this.gl.uniform1i(texLocation,0);



            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            this.set_attribute(arm2VBO, attLocation, attStride);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, arm2IBO);
            this.gl.bindTexture(this.gl.TEXTURE_2D,this.textures[0]);
            this.gl.drawElements(this.gl.TRIANGLES, arm2Data.i_triangles.length, this.gl.UNSIGNED_SHORT, 0);


            // コンテキストの再描画
            this.gl.flush();

            requestAnimationFrame(timerFunc);
        }
    };
    // - 各種ユーティリティ関数 --------------------------------------------------- *
    /**
     * シェーダを生成する関数
     * @param {string} source シェーダのソースとなるテキスト
     * @param {number} type シェーダのタイプを表す定数 this.gl.VERTEX_SHADER or this.gl.FRAGMENT_SHADER
     * @return {object} 生成に成功した場合はシェーダオブジェクト、失敗した場合は null
     */
    create_shader(source, type){
        // シェーダを格納する変数
        var shader;
        
        // シェーダの生成
        shader = this.gl.createShader(type);
        
        // 生成されたシェーダにソースを割り当てる
        this.gl.shaderSource(shader, source);
        
        // シェーダをコンパイルする
        this.gl.compileShader(shader);
        
        // シェーダが正しくコンパイルされたかチェック
        if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
            
            // 成功していたらシェーダを返して終了
            return shader;
        }else{
            
            // 失敗していたらエラーログをアラートする
            alert(this.gl.getShaderInfoLog(shader));
            
            // null を返して終了
            return null;
        }
    }

    /**
     * プログラムオブジェクトを生成しシェーダをリンクする関数
     * @param {object} vs 頂点シェーダとして生成したシェーダオブジェクト
     * @param {object} fs フラグメントシェーダとして生成したシェーダオブジェクト
     * @return {object} 生成に成功した場合はプログラムオブジェクト、失敗した場合は null
     */
    create_program(vs, fs){
        // プログラムオブジェクトの生成
        var program = this.gl.createProgram();
        
        // プログラムオブジェクトにシェーダを割り当てる
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        
        // シェーダをリンク
        this.gl.linkProgram(program);
        
        // シェーダのリンクが正しく行なわれたかチェック
        if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
        
            // 成功していたらプログラムオブジェクトを有効にする
            this.gl.useProgram(program);
            
            // プログラムオブジェクトを返して終了
            return program;
        }else{
            
            // 失敗していたらエラーログをアラートする
            alert(this.gl.getProgramInfoLog(program));
            
            // null を返して終了
            return null;
        }
    }

    /**
     * VBOを生成する関数
     * @param {Array.<number>} data 頂点属性を格納した一次元配列
     * @return {object} 頂点バッファオブジェクト
     */
    create_vbo(data){
        // バッファオブジェクトの生成
        var vbo = this.gl.createBuffer();
        
        // バッファをバインドする
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        
        // バッファにデータをセット
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        
        // バッファのバインドを無効化
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        
        // 生成した VBO を返して終了
        return vbo;
    }

    /**
     * IBOを生成する関数
     * @param {Array.<number>} data 頂点インデックスを格納した一次元配列
     * @return {object} インデックスバッファオブジェクト
     */
    create_ibo(data){
        // バッファオブジェクトの生成
        var ibo = this.gl.createBuffer();
        
        // バッファをバインドする
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        
        // バッファにデータをセット
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        
        // バッファのバインドを無効化
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        
        // 生成したIBOを返して終了
        return ibo;
    }

    /**
     * VBOをバインドし登録する関数
     * @param {object} vbo 頂点バッファオブジェクト
     * @param {Array.<number>} attribute location を格納した配列
     * @param {Array.<number>} アトリビュートのストライドを格納した配列
     */
    set_attribute(vbo, attL, attS){
        // 引数として受け取った配列を処理する
        for(var i in vbo){
            // バッファをバインドする
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
            
            // attributeLocationを有効にする
            this.gl.enableVertexAttribArray(attL[i]);
            
            // attributeLocationを通知し登録する
            this.gl.vertexAttribPointer(attL[i], attS[i], this.gl.FLOAT, false, 0, 0);
        }
    }

    /**
     * テクスチャを生成する関数
     * @param {string} source テクスチャに適用する画像ファイルのパス
     * @param {number} number テクスチャ用配列に格納するためのインデックス
     */
    create_texture(source, number, callback){
        // イメージオブジェクトの生成
        var img = new Image();

        // データのオンロードをトリガーにする
        img.onload = init.bind(this);
        function init(){
            // テクスチャオブジェクトの生成
            let tex = this.gl.createTexture();
            
            // テクスチャをバインドする
            this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
            
            // テクスチャへイメージを適用
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
            
            // ミップマップを生成
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            
            // テクスチャの補間に関する設定
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            // テクスチャの範囲外を参照した場合の設定
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            
            // テクスチャのバインドを無効化
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);


            // 生成したテクスチャを変数に代入
            this.textures[number] = tex;

            callback();
        };
        
        // イメージオブジェクトのソースを指定
        img.src = source;
    }
}



