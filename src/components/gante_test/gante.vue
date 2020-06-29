<template>
    <div class="ganteLiuBox">
        <div ref="gante_box" :style="{height:Number(height) ? height+'px': height}" class="gante-box">
            <!--切换-->
            <div :style="{width: Number(tabe_width)? tabe_width+'px' : tabe_width }" class="gante-out-op">
                <!--回到今天-->
                <div @click="toToday" class="to-today">{{today}}</div>
                <!--加减-->
                <div class="reOrde">
                    <span @click="op_time_mode(-1)" :style="{'pointer-events': time_mode > 1 ? 'auto' : 'none',color: time_mode > 1 ? '#666' : '#ccc'}" class="icons">＋</span>
                    <span @click="op_time_mode(1)" :style="{'pointer-events': time_mode < 5 ? 'auto' : 'none',color: time_mode < 5 ? '#666' : '#ccc'}" class="icons icon-20">-</span>
                </div>
                <div @click="toFullScreen" class="fullScreen">
                    <img v-if="fullScreen" src="../../assets/outScreen.png" alt="">
                    <img v-else src="../../assets/fullScreen.png" alt="">
                </div>
            </div>
            <!--左边表格-->
            <div :style="{width: Number(tabe_width)? tabe_width+'px' : tabe_width }" class="gante-table-box">
                <gante-table @sort="sortGunter" :th_data="th_data"
                             :showLoading="showLoading" :data="ganteData"></gante-table>
            </div>
            <!--右边时间-->
            <div class="gante-gc-box"
                 :style="{left:Number(tabe_width) ? tabe_width+'px': tabe_width,width: `calc(100% - ${Number(tabe_width) ? tabe_width +'px': tabe_width}) `}">
                <gante-gc ref="gante_gc" :start_time="start_time" :end_time="end_time" :th_data="th_data"
                          :gante_data="ganteData"></gante-gc>
            </div>
            <gante-split :left="tabe_width" :th_data="th_data"></gante-split>
        </div>
        <!--日历-->
        <calendar :left="calendar_left" :choose_date="checkDate" v-model="show_calendar" @change="chooseDate"
                  :top="calendar_top"></calendar>
    </div>
</template>
<script>
    import ganteTable from '../gante_test/gante-table.vue'
    import ganteGc from '../gante_test/gante-gc.vue'
    import ganteSplit from '../gante_test/gante-split.vue'
    import commitEmit from './commit'
    import calendar from './calendar.vue'
    import searchLastWidth from './search_last_width';
    import ganteOp from './gante_op';
    import myPublic from '../../../utils/public'
    let number = 0  //序号
    export default {
        mixins: [searchLastWidth,ganteOp],
        data() {
            return {
                checkModel: 1,
                tabe_width: 0, //表格的宽度
                time_mode: 1,//时间刻度 1:日,2周,3月,4季,5年
                th_data: {}, //表格头部数据
                ganteData: [],//甘特图的数据
                beforeTaskInfoList:[], // 前置任务关系
                _filterBeforeGunterData: [],//排序之前的数据
                height: 300,
                open: true,
                calendar_left: 0,  //日期选择的位置
                calendar_top: 0,//日期选择的位置
                show_calendar: false,
                checkDate: new Date(),//选中的日期
                change_id: '', //修改数据的id,修改时间用到
                change_value: '',//修改数据的值,修改时间用到
                start_time: 0, //最小的开始时间
                end_time: 0, //最大的结束时间
                edit_data: {},//修改后传递出的数据
                showLoading: true,
                onEdit: () => {},
                onClick: () => {},
                onLoad: () => {},//懒加载
                onDragChangeTime: () => {}, // 拖动改变时间
            }
        },
        created() {
            commitEmit.$off('change')
            commitEmit.$on('change', (data) => {
                this.change(data)
            });
            commitEmit.$off('change-calendar')
            commitEmit.$on('change-calendar', (data) => {
                this.change_calendar(data)
            });
            // 某个单元格的点击事件
            commitEmit.$off('on-click')
            commitEmit.$on('on-click', (data) => {
                this.onclick(data)
            });
            // 拖动改变时间
            commitEmit.$off('onDragChangeTime')
            commitEmit.$on('onDragChangeTime', (oldData,data) => {
                const resolves = (bol)=>{
                    if(!bol){
                        this.resetTask(this.ganteData,oldData);
                    }
                }
                this.onDragChangeTime(data,resolves)
            });


            //懒加载
            commitEmit.$off('on-load')
            commitEmit.$on('on-load', () => {
                /**
                 *
                 * @type {Function}
                 * requestBol: 是否显示加载图标
                 * data： 加载的数据
                 * start_time： 最小开始时间
                 * end_time： 最大的结束时间
                 */
                const resolve = ((requestBol, data, start_time, end_time) => {
                    if (!requestBol) {
                        this.showLoading = false
                    }
                    this.ganteData.push(...data)
                    this.start_time = start_time
                    this.end_time = end_time
                    this.init({ganteData: this.ganteData, start_time: this.start_time, end_time: this.end_time},false)
                    this.$nextTick(function () {
                        this.$refs.gante_gc.requestBol = requestBol
                    })
                })
                this.onLoad(resolve)
            });


            commitEmit.$off('triggerInit');
            commitEmit.$on('triggerInit', (start_time,end_time) =>{
                this.init({start_time: start_time, end_time: end_time},false)
            })
        },
        mounted() {
            this.$nextTick(function () {
                setTimeout(() => {
                    // 获取到左边表格所有td加起来的宽度
                    this.find_attr(document.getElementsByClassName('gante-table-box')[0].clientWidth, this.th_data)
                })
            })

        },
        methods: {
            //设置加载提示
            setShowLoading(data) {
                this.showLoading = data
                this.$refs.gante_gc.requestBol = data
            },
            /**
             * 排序
             * @param key 要排序的key值
             * @param mode 是正序还是倒叙 asc：正 desc：倒
             */
            sortGunter(key, mode) {
                console.log(mode)
                if (!key) {
                    this.ganteData = JSON.parse(JSON.stringify(this._filterBeforeGunterData))
                    return;
                }
                sortNum(this.ganteData, key, mode)
                number = 0
                formate_number(this.ganteData)
                function sortNum(data) {
                    data.sort(compare(key))
                    for (let i of data) {
                        if (i.children) {
                            sortNum(i.children, key)
                        }
                    }

                }

                function compare(property) {
                    return function (a, b) {
                        if (mode == 'asc') {
                            return (a[property] - b[property])
                        } else {
                            console.log(b,property)
                            return (b[property] - a[property])
                        }
                    }
                }

                function formate_number(data) {
                    for (let i of data) {
                        if (i.children) {
                            number++
                            i.params['number'] = number
                            formate_number(i.children)
                        } else {
                            number++
                            i.params['number'] = number
                        }
                    }
                }

                console.log(key)
                console.log(this.ganteData)
            },
//      选择日期
            chooseDate(date) {
                if (date) {
                    var year = date.getFullYear()
                    var month = date.getMonth() + 1
                    var day = date.getDate()
                    var time = year + '-' + (month < 10 ? ('0' + month) : month) + '-' + (day < 10 ? ('0' + day) : day)
                    this.change_value[0].value = time
                    this.change_value[1].value = new Date(year, month - 1, day).getTime()
                    this.change({
                        change_value: {
                            id: this.change_id,
                            value: this.change_value
                        }
                    })
                    this.init({ganteData: this.ganteData, start_time: this.start_time, end_time: this.end_time},false)
                }
            },
//      点击显示日历
            change_calendar(data) {
                console.log('展开', data.show_calendar)
                if (data.changeDate) {
                    this.checkDate = data.changeDate
                }
                this.show_calendar = data.show_calendar
                console.log(this.show_calendar)
                if (data.calendar_left != undefined) {
                    this.calendar_left = data.calendar_left
                }
                if (data.calendar_top != undefined) {
                    this.calendar_top = data.calendar_top
                }
                if (data.change_value != undefined) {
                    this.change_id = data.change_value.id
                    this.change_value = data.change_value.argument
                }
            },
//      监听点击事件
            onclick(data) {
                if (typeof this.onClick === 'function') {
                    for (let i in data.data) {
                        //返回数据的时候去掉没用的数据
                        if (i == 'width' || i == 'left' || i == 'open') {
                            delete data.data[i]
                        }
                    }
                    this.onClick(data)
                }
            },
//      统一改变数据
            change(data) {
                //修改数据
                if (data.change_value) {
                    this.gunter_data_change(data.change_value.id, data.change_value.value, this.ganteData)
                    if (typeof this.onEdit === 'function') {
                        for (let i in this.edit_data.data) {
                            if (i == 'width' || i == 'left' || i == 'open') {
                                delete this.edit_data.data[i]
                            }
                        }
                        this.onEdit(this.edit_data)
                    }
                }
            },
            /**
             *  统一修改甘特图数据的方法
             * @param id  修改的甘特图数据的id
             * @param value  修改的甘特图数据的值（argument: 修改的是哪个参数，value：值）
             * @param data  甘特图数据
             */
            gunter_data_change(id, value, data) {
                for (let i of data) {
                    if (i.gunter_id == id) {
                        for (let s of value) {
                            //修改时间用到的
                            if (s.mode) {
                                this.$set(i, s.argument, s.value)
                            } else {
                                this.$set(i['params'], s.argument, s.value)
                            }

                        }
                        this.edit_data['data'] = JSON.parse(JSON.stringify(i))
                        this.edit_data['argument'] = value[0].argument
                        this.edit_data['value'] = value[0].value
                    }
//          判断最小开始时间和最大结束时间
                    if (this.start_time > i.start_time && (i.start_time)) {
                        this.start_time = i.start_time
                    }
                    if (this.end_time < i.end_time && i.end_time) {
                        this.end_time = i.end_time
                    }
                    if (i.children) {
                        this.gunter_data_change(id, value, i.children)
                    }
                }
            },
            // 重置任务，在拖动时间后如果没有权限后重置任务
            resetTask(ganteData,oldData){
                for(let i of ganteData){
                    if(i.gunter_id  == oldData.gunter_id){
                        this.$set(i,'start_time',new Date(myPublic.dateFormat.dateReplace(oldData.start_time)).getTime());
                        this.$set(i,'end_time',new Date(myPublic.dateFormat.dateReplace(oldData.end_time)).getTime());
                        this.$set(i.params,oldData.startAttr,oldData.start_time);
                        this.$set(i.params,oldData.endAttr,oldData.end_time);
                        this.$set(i,'width',oldData.width);
                        this.$set(i,'left',oldData.left);
                        break;
                    }
                    if(i.children){
                        this.resetTask(i.children,oldData)
                    }
                }
            },
//      初始化
            init(params,mode = true) {

                Object.assign(this.$data, params);

                if(params.ganteData == undefined){
                    let ganteData = JSON.parse(JSON.stringify(this.ganteData));
                    this.ganteData = [];
                    this.ganteData = ganteData;
                }else{
                    this.ganteData = JSON.parse(JSON.stringify(params.ganteData));
                }

                if(!params.openLoad && mode){
                    this.showLoading = false
                    this.$nextTick(function () {
                        this.$refs.gante_gc.requestBol = false
                    })
                }
                if(!this.th_data.number){
                    let number = {number:{value:'序号',width:50,showToast:false,listen_click:false,weight:true}}
                    this.th_data = Object.assign(number,this.th_data)
                }
                let current_date = new Date().getTime();
                if (current_date < this.start_time) {
                    this.start_time = current_date;
                }
                if (current_date > this.end_time) {
                    this.end_time = current_date;
                }

                this.$nextTick(function () {
                    let data = this.$refs.gante_gc.init(this.time_mode);
                    number = 0;
                    format_gante_data(this.ganteData, data.time, data.start_time)
                    this._filterBeforeGunterData = JSON.parse(JSON.stringify(this.ganteData))
                    if (mode) {
                        if (params.tabe_width != undefined) {
                            this.tabe_width = params.tabe_width
                        } else {
                            let _width = this.$refs.gante_box.clientWidth
                            this.tabe_width = _width / 2
                        }
                    }
                })
                let self = this;

                /**
                 *  处理甘特图数据
                 * @param gante_data    甘特图的数据
                 * @param time  1px代表的时间
                 * @param start_time 开始时间
                 * @param parent_gunter_id 父元素的id
                 */
                function format_gante_data(gante_data, time, start_time,parent_gunter_id = null) {
                    for (let i of gante_data) {
                        if (i.open == undefined) {
                            self.$set(i, 'open', self.open)
                        }
                        if (i.start_time || i.end_time) {
                            i['left'] = (i.start_time - start_time) / time
                            if (i.end_time && i.end_time >= i.start_time && i.start_time) {
                                let width = (i.end_time - i.start_time) / time
                                // let width = (new Date(new Date(i.end_time).getFullYear(),new Date(i.end_time).getMonth(),new Date(i.end_time).getDate()+1) - i.start_time)/time
                                if (width >= 0 && width <= 1) {
                                    width = 1
                                }
                                i['width'] = width
                            } else {
                                i['width'] = 0
                            }
                        }
                        i['parent_gunter_id'] = parent_gunter_id

                        i['showLoading'] = false
                        if (i.children) {
                            number++
                            self.$set(i.params,'number',number)
                            format_gante_data(i.children, time, start_time,i.gunter_id)
                        }else{
                            number++
                            self.$set(i.params,'number',number)
                        }
                    }
                }

            },
        },
        components: {
            ganteTable,
            ganteGc,
            ganteSplit,
            calendar
        }
    }
</script>
<style lang="less">
    li {
        list-style: none;
    }

    .ganteLiuBox {
        height: 100%;
    }

    .gante-box {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 5px;
        background: #fff;
        border: 1px solid #ccc;
        box-sizing: border-box;
        .gante-top-op{
            height: 54px;
            padding: 0 10px 0 20px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 3;
            .btns{
                /deep/.el-button-group{
                    width: 140px!important;
                }
                /deep/.btn-one{
                    text-align: left!important;
                }
                /deep/.el-button{
                    &:first-child{
                        width:86px!important;
                        border-radius: 17px 0 0 17px;
                    }
                    &:nth-child(2){
                        border-radius:  0 17px 17px 0 ;
                        padding: 10px 11px!important;
                    }
                }
            }
            .filter{
                display: flex;
                .filter-one{
                    position: relative;
                    margin-left: 15px;
                    .projectName{
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                        &:hover{
                            color: #3396fb;
                        }
                        .name{
                            margin-right: 5px;
                        }
                    }
                }
                .opens{
                    position: relative;
                    cursor: pointer;
                    &:hover{
                        color: #3396fb;
                    }
                    &:after{
                        content: '';
                        position: absolute;
                        left: -18px;
                        top: 2px;
                        height: 17px;
                        width: 1px;
                        background: #ccc;
                    }
                }
                .batch{
                    cursor: pointer;
                    &:hover{
                        color: #3396fb;
                    }
                }
            }
            /*级联选择框*/
            .cascade-content{
                position: relative;
                height: 19px;
                line-height: 20px;
                padding-right: 25px;
                .text{
                    cursor: pointer;
                    &:hover{
                        color: #3396fb;
                    }
                }
                .icon-right{
                    position: absolute;
                    right: 5px;
                    top: 3px;
                }
                .cascade-menu{
                    background: #fff;
                    position: absolute;
                    max-height: 275px;
                    overflow-y: overlay;
                    right: 0;
                    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
                    top: 32px;
                    display: flex;
                    border-radius: 4px;
                    .cascade-menu-one{
                        height: 100%;
                        max-height: 275px;
                        overflow-y: overlay;
                        border-right: 1px solid #ccc;
                        box-sizing: border-box;
                        min-width: 140px;
                        padding: 10px;
                        border-right: 1px solid #e4e7ed;
                        &:last-child{
                            border-right: none;
                        }
                        .menu-one{
                            padding: 8px 16px;
                            border-radius: 4px;
                            cursor: pointer;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            &:hover{
                                background: #eee;
                            }
                        }
                        .menu-one.active{
                            color: #3396fb;
                        }
                    }
                }
                &:before{
                    content: " ";
                    position: absolute;
                    display: block;
                    width: 0;height: 0;
                    top: 24px;
                    left: calc(50% - 20px);
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-bottom: 8px solid rgba(0,0,0,.1);
                }
                &:after{
                    content: " ";
                    position: absolute;
                    display: block;
                    width: 0;
                    height: 0;
                    top:24px;
                    left:calc(50% - 20px);
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-bottom: 8px solid #fff;
                }
            }
        }
    }

    .gante-table-box {
        overflow-x: auto;
        overflow-y: hidden;
        width: 50%;
        left: 0;
        top: 54px;
        bottom: 0;
        position: absolute;
    }

    .gante-gc-box {
        overflow: auto;
        width: 50%;
        position: absolute;
        top: 0;
        border-left: 5px solid transparent;
        height: 100%;
        box-sizing: border-box;
        padding-right: 2px;
    }

    .change-mode {
        width: 65px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        display: inline-block;
        background: #00b0ff;
        border-radius: 3px;
        color: #fff;
        margin-top: 10px;
        cursor: pointer;
    }

    .gante-toast-liu {
        position: fixed;
        z-index: 10000;
        width: 250px;
        height: auto;
        font-size: 13px;
        line-height: 20px;
        font-family: "Microsoft Yahei";
        border-radius: 3px;
        transition: left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s;
        background-color: rgba(50, 50, 50, 0.7);
        padding: 10px;
        color: #fff;
    }

    .unselecttable {
        -webkit-touch-callout: none; /*系统默认菜单被禁用*/
        -webkit-user-select: none; /*webkit浏览器*/
        -khtml-user-select: none; /*早期浏览器*/
        -moz-user-select: none; /*火狐*/
        -ms-user-select: none; /*IE10*/
        user-select: none;
    }

    .gante-out-op {
        display: flex;
        z-index: 10;
        .gante-trigger, .to-today {
            margin-right: 20px;
            border-radius: 3px;
            padding: 5px 12px;
            background: #fff;
            border: 1px solid #ccc;
            cursor: pointer;
            &:hover {
                background: #f5f5f5;
                color: #3396fb;
            }
        }

        .reOrde {
            display: flex;
            align-items: center;
            margin-right: 20px;
            border: 1px solid #ccc;
            .icons{
                padding: 8px 8px;
                cursor: pointer;
                background: #fff;
                &:hover {
                    background: #f5f5f5;
                    color: #3396fb!important;
                }
                &:first-child{
                    border-radius: 3px 0 0 3px;
                    border-right: 1px solid rgba(0,0,0,0.05);
                }
                &:last-child{
                    border-radius: 0 3px 3px 0;
                    padding: 8px 12px;
                }
            }
        }
        .fullScreen{
            border-radius: 3px;
            padding: 5px 12px;
            background: #fff;
            border: 1px solid #ccc;
            cursor: pointer;
            img{
                width: 20px;
                height: 20px;
            }
            &:hover{
                background: #f5f5f5;
                color: #3396fb;
            }
        }
    }
    .project_op_drop .el-dropdown-menu__item{
        letter-spacing: 0!important;
    }
</style>
<style scoped lang="less">
    .projectTabs{
        position: absolute;
        width: 170px;
        left: -75px;
        top: 25px;
        min-width: 80px!important;
        background: #fff;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        padding: 10px;
        border-radius: 4px;
        .mode-one{
            line-height: 30px;
            cursor: pointer;
            padding: 0 5px;
            border-radius: 4px;
            transition: all .2s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            &:hover{
                background: #eee;
            }
        }
        .mode-one.active{
            color: #3396fb;
        }
    }
    /*拖动排序*/
    .gu-transit {
        opacity: 0.2;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=20)";
        filter: alpha(opacity=20);
    }
    .gu-mirror {
        position: fixed !important;
        margin: 0 !important;
        z-index: 9999 !important;
        opacity: 1!important;
        border-radius: 5px!important;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=80)"!important;
        filter: alpha(opacity=80)!important;
        box-shadow: 0 1px 2px 2px rgba(0, 0, 0, 0.1);
        background: #fff;
    &:hover{
         background: #fff;
         cursor: grabbing!important;
     }
    }
    .gu-hide {
        display: none !important;
    }
    .gu-unselectable {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
    }
</style>
