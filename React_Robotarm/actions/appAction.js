// ============================================================================
// action
// ============================================================================

export default class Action{
    constructor(props){
        this.dispatcher = props.dispatcher;

        this.c;
        this.gl;
        this.vs;
        this.fs;
        this.textures = [];


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


//main.jsからコピペ
//必要なものをべちゃべちゃ貼り付けてる。きたない


    initWebGL(){
        // - canvas と WebGL コンテキストの初期化 -------------------------------------
        // canvasエレメントを取得
        //c = document.getElementById('canvas');
        c = 

        // webglコンテキストを取得
        gl = c.getContext('webgl') || c.getContext('experimental-webgl');

        //create_texture("bluetex.jpg",0, initialize);
        create_texture("w089_03.jpg",0,initialize);

    }

    initialize(){


        // - シェーダとプログラムオブジェクトの初期化 ---------------------------------
        // シェーダのソースを取得
        vs = document.getElementById('vs').textContent;
        fs = document.getElementById('fs').textContent;
        
        // 頂点シェーダとフラグメントシェーダの生成
        var vShader = create_shader(vs, gl.VERTEX_SHADER);
        var fShader = create_shader(fs, gl.FRAGMENT_SHADER);

        // プログラムオブジェクトの生成とリンク
        var prg = create_program(vShader, fShader);


        // - 頂点属性に関する処理 ----------------------------------------------------- *
        // attributeLocationの取得
        var attLocation = [];
        attLocation[0] = gl.getAttribLocation(prg, 'position');
        attLocation[1] = gl.getAttribLocation(prg, 'color');
        attLocation[2] = gl.getAttribLocation(prg, "normal");
        attLocation[3] = gl.getAttribLocation(prg,"texCoord");

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
        handVBO[0] = create_vbo(handData.p);
        handVBO[1] = create_vbo(handData.c);
        handVBO[2] = create_vbo(handData.n);
        handVBO[3] = create_vbo(handData.t);


        var handIBO = create_ibo(handData.i_triangles);

        // VBOのバインドと登録
        set_attribute(handVBO, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, handIBO);

        // VBOの生成
        var jointVBO = [];
        jointVBO[0] = create_vbo(jointData.p);
        jointVBO[1] = create_vbo(jointData.c);
        jointVBO[2] = create_vbo(jointData.n);
        jointVBO[3] = create_vbo(jointData.t);


        var jointIBO = create_ibo(jointData.i_triangles);

        // VBOのバインドと登録
        set_attribute(jointVBO, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, jointIBO);

        // VBOの生成
        var rootVBO = [];
        rootVBO[0] = create_vbo(rootData.p);
        rootVBO[1] = create_vbo(rootData.c);
        rootVBO[2] = create_vbo(rootData.n);
        rootVBO[3] = create_vbo(rootData.t);


        var rootIBO = create_ibo(rootData.i_triangles);

        // VBOのバインドと登録
        set_attribute(rootVBO, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rootIBO);


        // VBOの生成
        var arm1VBO = [];
        arm1VBO[0] = create_vbo(arm1Data.p);
        arm1VBO[1] = create_vbo(arm1Data.c);
        arm1VBO[2] = create_vbo(arm1Data.n);
        arm1VBO[3] = create_vbo(arm1Data.t);

        var arm1IBO = create_ibo(arm1Data.i_triangles);

        // VBOのバインドと登録
        set_attribute(arm1VBO, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm1IBO);

        // VBOの生成
        var arm2VBO = [];
        arm2VBO[0] = create_vbo(arm2Data.p);
        arm2VBO[1] = create_vbo(arm2Data.c);
        arm2VBO[2] = create_vbo(arm2Data.n);
        arm2VBO[3] = create_vbo(arm2Data.t);

        var arm2IBO = create_ibo(arm2Data.i_triangles);

        // VBOのバインドと登録
        set_attribute(arm2VBO, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm2IBO);


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
        
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        
        var lightDirection = [0.577, 0.577, 0.577];




        //根元スライダ情報取得
        //まがる
        var ele_slider1 = document.getElementById("slider1");
        var slider1 = 0.0;
        ele_slider1.addEventListener("input",function(eve)
        {
            slider1 = eve.currentTarget.value - 0;//cast
        },false);
        //ひねる
        var ele_slider10 = document.getElementById("slider10");
        var slider10 = 0.0;
        ele_slider10.addEventListener("input",function(eve)
        {
            slider10 = eve.currentTarget.value - 0;//cast
        },false);

        //中央スライダ情報取得
        //まがる
        var ele_slider2 = document.getElementById("slider2");
        var slider2 = 0.0;
        ele_slider2.addEventListener("input",function(eve)
        {
            slider2 = eve.currentTarget.value - 0;//cast
        },false);
        //ひねる
        var ele_slider20 = document.getElementById("slider20");
        var slider20 = 0.0;
        ele_slider20.addEventListener("input",function(eve)
        {
            slider20 = eve.currentTarget.value - 0;//cast
        },false);


        //socket.io関係	
        var guestdata_list = [];
        var myIP = 0;


        var socket = io.connect();//connection開始
        var ele_ipbox = document.getElementById("ip_box");
        // var ele_button_disconnect = document.getElementById("button_disconnect");
        // ele_button_disconnect.addEventListener("click",function(){
        // 	console.log("切断")
        // 	socket.disconnect();
        // })

        socket.on("push1",function(push_data){//サーバーから受信
            ele_slider1.value = push_data;
            slider1 = push_data;
            console.log("receive push_data : " + push_data);
        });
        socket.on("push10",function(push_data){//サーバーから受信
            ele_slider10.value = push_data;
            slider10 = push_data;
            console.log("receive push_data : " + push_data);
        });
        socket.on("push2",function(push_data){//サーバーから受信
            ele_slider2.value = push_data;
            slider2 = push_data;
            console.log("receive push_data : " + push_data);
        });
        socket.on("push20",function(push_data){//サーバーから受信
            ele_slider20.value = push_data;
            slider20 = push_data;
            console.log("receive push_data : " + push_data);
        });

        socket.on("push_guest_list",function(push_data){//接続してる人たち
            console.log("書き変わってます")
            guestdata_list = push_data;
            console.log("receive guestdata_list : " + push_data);
            ele_ipbox.value = "";
            for(var i=0;i<guestdata_list.length;i++){
                ele_ipbox.value += ("[" + guestdata_list[i] + "]\n");
            }
        });
        socket.on("push_guest",function(push_data){//自分のIPキープしとく
            myIP = push_data;
            console.log("私のIPは" + myIP)
        });
        socket.on("connect",function(){
        　//タイムアウトを5秒に設定する
        　socket.headbeatTimeout = 5000;
        });
        window.onbeforeunload = function (e) {
            console.log("disconnected..." + myIP)
            socket.emit("user_disconnected",myIP);

        }
        
        //スライダ情報の取得
        ele_slider1.addEventListener("change",function(eve){
            socket.emit("send1",ele_slider1.value);//サーバーへ送信
        },false);
        ele_slider10.addEventListener("change",function(eve){
            socket.emit("send10",ele_slider10.value);//サーバーへ送信
        },false);
        ele_slider2.addEventListener("change",function(eve){
            socket.emit("send2",ele_slider2.value);//サーバーへ送信
        },false);
        ele_slider20.addEventListener("change",function(eve){
            socket.emit("send20",ele_slider20.value);//サーバーへ送信
        },false);


            

        //マウスドラッグでY軸回転
        var flgDrag = false;
        var startDrag = 0;
        var cameraRadXZ = 0;
        var resultCameraRadXZ = 0;
        c.addEventListener("mousemove",function(eve)
        {
            if(flgDrag === false){
                startDrag = eve.offsetX;
            }else{
                cameraRadXZ = resultCameraRadXZ + eve.offsetX - startDrag;
            }	
        },false);

        c.addEventListener("mouseup",function(eve){
            flgDrag = false;
            resultCameraRadXZ = cameraRadXZ;
        },false)
        c.addEventListener("mouseout",function(eve){
            flgDrag = false;
            resultCameraRadXZ = cameraRadXZ;
        },false)
        c.addEventListener("mousedown",function(eve){
            flgDrag = true;
        },false)

        var counter = 0;

        timerFunc();
        function timerFunc()
        {

            counter++;

            // - レンダリングのための WebGL 初期化設定 ------------------------------------
            // ビューポートを設定する
            gl.viewport(0, 0, c.width, c.height);

            // canvasを初期化する色を設定する
            gl.clearColor(0.1, 0.7, 0.7, 1.0);

            // canvasを初期化する際の深度を設定する
            gl.clearDepth(1.0);

            // canvasを初期化
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.enable(gl.DEPTH_TEST);

            // - 行列の計算 ---------------------------------------------------------------
            // ビュー座標変換行列
            var camera_x = Math.sin(cameraRadXZ/100);
            var camera_z = Math.cos(cameraRadXZ/100);
            //var camera_x = 1;
            //var camera_z = 1;
            var camera_pull = 50;

            m.lookAt([camera_x * camera_pull, 1.0, camera_z * camera_pull], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);

            // プロジェクション座標変換行列
            m.perspective(45, c.width / c.height, 0.1, 100.0, pMatrix);

            //mMatrix操作
            mArm1Matrix = m.identity(m.create());
            mArm2Matrix = m.identity(m.create());
            mHandMatrix = m.identity(m.create());
            mJointMatrix = m.identity(m.create());
            mRootMatrix = m.identity(m.create());

            var rotateArm1;
            m.rotate(mArm1Matrix,slider10,[0.0,1.0,0.0],mArm1Matrix);
            m.rotate(mArm1Matrix,slider1,[1.0,0.0,0.0],mArm1Matrix)

            m.translate(mArm1Matrix,[0.0,lengthArm,0.0],mArm2Matrix);
            m.rotate(mArm2Matrix,slider20,[0.0,1.0,0.0],mArm2Matrix);
            m.rotate(mArm2Matrix,slider2,[1.0,0.0,0.0],mArm2Matrix);

            m.translate(mArm1Matrix,[0.0,lengthArm,0.0],mJointMatrix);

            m.translate(mArm2Matrix,[0.0,lengthArm,0.0],mHandMatrix);


            // - uniform 関連の初期化と登録 -----------------------------------------------
            // uniformLocationの取得
            var uniLocation = [];
            uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
            uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
            uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');
            uniLocation[3] = gl.getUniformLocation(prg, "invtransposeMatrix");
            uniLocation[4] = gl.getUniformLocation(prg, "mv_invtransposeMatrix");
            
            var texLocation = gl.getUniformLocation(prg, "texture");


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
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            gl.uniform3fv(uniLocation[2], lightDirection);
            gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)

            gl.uniform1i(texLocation,0);

            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            set_attribute(handVBO, attLocation, attStride);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, handIBO);
            gl.bindTexture(gl.TEXTURE_2D,textures[0]);
            gl.drawElements(gl.TRIANGLES, handData.i_triangles.length, gl.UNSIGNED_SHORT, 0);

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
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            gl.uniform3fv(uniLocation[2], lightDirection);
            gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)

            //gl.uniform1i(texLocation,0);

            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            set_attribute(jointVBO, attLocation, attStride);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, handIBO);
            gl.bindTexture(gl.TEXTURE_2D,textures[0]);
            gl.drawElements(gl.TRIANGLES, jointData.i_triangles.length, gl.UNSIGNED_SHORT, 0);

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
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            gl.uniform3fv(uniLocation[2], lightDirection);
            gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)

            //gl.uniform1i(texLocation,0);

            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            set_attribute(rootVBO, attLocation, attStride);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rootIBO);
            gl.bindTexture(gl.TEXTURE_2D,textures[0]);
            gl.drawElements(gl.TRIANGLES, rootData.i_triangles.length, gl.UNSIGNED_SHORT, 0);

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
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            gl.uniform3fv(uniLocation[2], lightDirection);
            gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)
            //gl.uniform1i(texLocation,0);


            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            set_attribute(arm1VBO, attLocation, attStride);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm1IBO);
            gl.bindTexture(gl.TEXTURE_2D,textures[0]);
            gl.drawElements(gl.TRIANGLES, arm1Data.i_triangles.length, gl.UNSIGNED_SHORT, 0);

            
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
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            gl.uniform3fv(uniLocation[2], lightDirection);
            gl.uniformMatrix4fv(uniLocation[3], false, invtransposeMatrix)
            gl.uniformMatrix4fv(uniLocation[4], false, mv_invtransposeMatrix)

            //gl.uniform1i(texLocation,0);



            // - レンダリング ------------------------------------------------------------- *
            // モデルの描画
            set_attribute(arm2VBO, attLocation, attStride);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm2IBO);
            gl.bindTexture(gl.TEXTURE_2D,textures[0]);
            gl.drawElements(gl.TRIANGLES, arm2Data.i_triangles.length, gl.UNSIGNED_SHORT, 0);


            // コンテキストの再描画
            gl.flush();

            requestAnimationFrame(timerFunc);
        }
    };
    // - 各種ユーティリティ関数 --------------------------------------------------- *
    /**
     * シェーダを生成する関数
     * @param {string} source シェーダのソースとなるテキスト
     * @param {number} type シェーダのタイプを表す定数 gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @return {object} 生成に成功した場合はシェーダオブジェクト、失敗した場合は null
     */
    create_shader(source, type){
        // シェーダを格納する変数
        var shader;
        
        // シェーダの生成
        shader = gl.createShader(type);
        
        // 生成されたシェーダにソースを割り当てる
        gl.shaderSource(shader, source);
        
        // シェーダをコンパイルする
        gl.compileShader(shader);
        
        // シェーダが正しくコンパイルされたかチェック
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            
            // 成功していたらシェーダを返して終了
            return shader;
        }else{
            
            // 失敗していたらエラーログをアラートする
            alert(gl.getShaderInfoLog(shader));
            
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
        var program = gl.createProgram();
        
        // プログラムオブジェクトにシェーダを割り当てる
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        
        // シェーダをリンク
        gl.linkProgram(program);
        
        // シェーダのリンクが正しく行なわれたかチェック
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        
            // 成功していたらプログラムオブジェクトを有効にする
            gl.useProgram(program);
            
            // プログラムオブジェクトを返して終了
            return program;
        }else{
            
            // 失敗していたらエラーログをアラートする
            alert(gl.getProgramInfoLog(program));
            
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
        var vbo = gl.createBuffer();
        
        // バッファをバインドする
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        
        // バッファにデータをセット
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        
        // バッファのバインドを無効化
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
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
        var ibo = gl.createBuffer();
        
        // バッファをバインドする
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        
        // バッファにデータをセット
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        
        // バッファのバインドを無効化
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
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
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            
            // attributeLocationを有効にする
            gl.enableVertexAttribArray(attL[i]);
            
            // attributeLocationを通知し登録する
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
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
        img.onload = function(){
            // テクスチャオブジェクトの生成
            var tex = gl.createTexture();
            
            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, tex);
            
            // テクスチャへイメージを適用
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            
            // ミップマップを生成
            gl.generateMipmap(gl.TEXTURE_2D);
            
            // テクスチャの補間に関する設定
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            // テクスチャの範囲外を参照した場合の設定
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // テクスチャのバインドを無効化
            gl.bindTexture(gl.TEXTURE_2D, null);


            // 生成したテクスチャを変数に代入
            textures[number] = tex;

            callback();
        };
        
        // イメージオブジェクトのソースを指定
        img.src = source;
    }
}


