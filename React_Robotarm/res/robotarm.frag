precision mediump float;
uniform sampler2D texture;

varying vec2 textureCoord;
varying vec4 vColor;

void main(){

	vec4 smpColor = texture2D(texture,textureCoord.st);

	gl_FragColor = smpColor * vColor;
}
