export const ImageSizeIncrease = (element:HTMLImageElement):void=>{
    if(!element)  throw Error('Image Element is Missing');
    element.classList.toggle('scale-[1.5]')
}