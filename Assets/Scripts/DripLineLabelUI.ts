import {FlexLayout} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout';
import {FlexItem} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem';
import {FlexDirection,FlexAlign,FlexJustify,FlexAlignSelf} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes';
// Surface intentionally has no BackPlate: the requested single line sits on the counter.
@component
export class DripLineLabelUI extends BaseScriptComponent {
 @input @hint('Visible letter height in centimeters') @widget(new SliderWidget(1,4,0.1)) letterHeightCm:number=2.5;
 private label:Text;
 onAwake(){this.createEvent('OnStartEvent').bind(()=>this.build());}
 private build(){
  this.sceneObject.createComponent('Component.Canvas');
  const layout=this.sceneObject.createComponent(FlexLayout.getTypeName()) as FlexLayout;
  const line=global.scene.createSceneObject('DripLine Phase Text');line.setParent(this.sceneObject);
  const item=line.createComponent(FlexItem.getTypeName()) as FlexItem;item.overrideWidth=32;item.overrideHeight=4.5;item.alignSelf=FlexAlignSelf.Stretch;
  this.label=line.createComponent('Component.Text');this.label.size=this.letterHeightCm*43.886/0.695;this.label.weight=500;
  this.label.depthTest=true;this.label.horizontalOverflow=HorizontalOverflow.Overflow;this.label.verticalOverflow=VerticalOverflow.Overflow;
  this.label.horizontalAlignment=HorizontalAlignment.Center;this.label.verticalAlignment=VerticalAlignment.Center;
  this.label.layoutRect=Rect.create(-16,16,-2.25,2.25);this.label.text='';
  this.label.textFill.color=new vec4(1,0.96,0.8,1);
  layout.onInitialized.add(()=>{layout.width=32;layout.height=4.5;layout.direction=FlexDirection.Column;layout.alignItems=FlexAlign.Stretch;layout.justifyContent=FlexJustify.Center;layout.addItems([item]);});
 }
 setLabel(value:string,alpha=1){if(!this.label)return;this.label.text=value;this.label.textFill.color=new vec4(1,0.96,0.8,alpha);}
}
