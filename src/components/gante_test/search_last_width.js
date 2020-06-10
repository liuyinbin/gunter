export default {
    methods:{
        find_attr(_width,th_data){
            let str = 0;
            for(let key in th_data){
                if(th_data[key].show != false){
                    str += th_data[key].width ? Number(th_data[key].width) + 1 : 81;
                }
            }
            if(str < _width){
                let last_attr = this.find_last_attr(1,th_data)
                //为了预防不能拖动最后一个菜单所以-2\
                console.log(last_attr)
                let last_width = last_attr.width ? Number(last_attr.width) - 2 : 78
                this.$set(last_attr,'width', _width - (str - last_width))

            }
        },
        find_last_attr(num,th_data){
            if(!th_data[Object.keys(th_data)[Object.keys(th_data).length - num]].is_op && th_data[Object.keys(th_data)[Object.keys(th_data).length - num]].show != false){
                 return th_data[Object.keys(th_data)[Object.keys(th_data).length - num]]
            }else{
                return this.find_last_attr(num+1,th_data)
            }
        }
    }
}
