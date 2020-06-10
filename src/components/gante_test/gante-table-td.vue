<!--表格td-->
<template>
    <div>
        <!--fontWeight:((td_data.level ==1 && th.shrink && !th.weight)||th.value==$t('task.detail.number')) ?'bold':'normal'-->
        <div
            ref="cells"
            class="cell detail_click"
            @click.stop="to_edit($refs.cells,td_data)"
            :style="{
            width:th.width ? th.width+'px' : '80px',
            padding:th.shrink ? '0 18px' : '0 10px',
            paddingLeft:th.shrink ? (td_data.level + 1)*18+'px' : null}">
			<span :style="{color:td_data.color ? td_data.color[key_value] : null}" class="cell-value">
                <span class="trigger"  @click.stop="opens()" v-if="th.shrink && td_data.children">
                     <span v-show="td_data.children" style="cursor: pointer;"
                          >
                         <span style="display: inline-block"
                               :style="{transform: !td_data.open ? 'rotateZ(-90deg)' : null}"
                               class="open-icon"></span>
                     </span>
                    <!--<span v-show="td_data.showLoading" class="el-icon-loading"></span>-->
                </span>
                <span v-if="td_data.level >= 1 && th.shrink && !td_data.children" class="spot"></span>
                <span v-html="td_data.params[key_value]"></span>
            </span>
        </div>
        <input class="gante_edit_input_liu" @click="change_calendar($refs.cells,td_data.params[key_value])"
               :readonly="th.chooseTime" ref="gante_input" v-if="edit" @blur="td_blur(td_data.gunter_id)" type="text"
               :value="td_data.params[key_value]">
    </div>
</template>
<script>
    import commitEmit from './commit'

    export default {
        data() {
            return {
                edit: false,
                showLoading: false,//控制显示加载图标
            }
        },
        props: {
            td_data: Object,
            th: Object,
            index: Number,
            key_value: String,
            is_load_child: Boolean
        },
        methods: {
//      获取元素距离浏览器的距离
            getPos(ele) {
                var p = ele.offsetParent;
                var left = ele.offsetLeft;
                var top = ele.offsetTop
                while (p) {
                    if (window.navigator.userAgent.indexOf("MSIE 8") > -1) {
                        left += p.offsetLeft;
                        top += p.offsetTop;
                    } else {
                        left += p.offsetLeft + p.clientLeft;
                        top += p.offsetTop + p.clientTop;
                    }
                    p = p.offsetParent;
                }
                var obj = {};
                obj.x = left;
                obj.y = top;
                return obj;
            },
//      编辑任务
            to_edit(e, value) {
                console.log('this.th_data', this.td_data)
                if (this.th.edit || this.th.chooseTime) {
                    this.edit = true
                    if (this.th.chooseTime) {
                        var time = '',
                            left = this.getPos(e.parentNode.parentNode).x,
                            top = this.getPos(e.parentNode.parentNode).y + 44,
                            gante_table_box = document.getElementsByClassName('gante-table-box')[0],
                            ganteview = document.getElementsByClassName('ganteview')[0]
                        if (value.params[this.key_value] == '' || value.params[this.key_value] == null) {
                            time = new Date()
                        } else {
                            if (!Number(value.params[this.key_value])) {
                                time = new Date(value.params[this.key_value].replace(/\-/g, '/'))
                            } else {
                                time = Number(value.params[this.key_value])
                            }
                        }
                        if (gante_table_box.scrollLeft) {
                            left = left - gante_table_box.scrollLeft
                        }
                        if (ganteview.scrollTop) {
                            top = top - ganteview.scrollTop
                        }
                        commitEmit.$emit('change-calendar', {
                            show_calendar: true,
                            change_value: {
                                id: value.gunter_id,
                                argument: [
                                    {argument: this.key_value},
                                    {argument: this.th.time_mode == 1 ? 'start_time' : 'end_time', mode: true}
                                ]
                            },
                            changeDate: time,
                            calendar_left: left,
                            calendar_top: top
                        })
                    } else {
                        commitEmit.$emit('change-calendar', {show_calendar: false})
                    }
                    this.$nextTick(function () {
                        this.$refs.gante_input.focus()
                    })
                } else {
                    commitEmit.$emit('change-calendar', {show_calendar: false})
                }

                if (this.th.listen_click) {
                    commitEmit.$emit('on-click', {
                        argument: this.key_value,
                        value: this.td_data.params[this.key_value],
                        data: JSON.parse(JSON.stringify(this.td_data))
                    })
                }
            },
//      点击input时事件
            change_calendar(e) {
                if (this.th.chooseTime) {
                    commitEmit.$emit('change-calendar', {
                        show_calendar: true,
                        calendar_left: this.getPos(e.parentNode.parentNode).x,
                        calendar_top: this.getPos(e.parentNode.parentNode).y + 44
                    })
                }
            },
            td_blur(id) {
//        判断有没有修改值
                if (this.$refs.gante_input.value != this.td_data.params[this.key_value]) {
                    commitEmit.$emit('change', {
                        change_value: {
                            id: id,
                            value: [{argument: this.key_value, value: this.$refs.gante_input.value}]
                        }
                    })
                }
                this.edit = false
            },
//      展开收缩任务
            opens() {
                //展开
                this.$set(this.td_data, 'open', !this.td_data.open);
            }
        }
    }
</script>
<style>
    .project_op_drop{
        min-width: 105px!important;
        padding: 10px!important;
        box-sizing: border-box!important;
        text-align: center!important;
    }
    .project_op_drop .el-dropdown-menu__item{
        border-radius: 4px!important;
    }
    .project_op_drop .el-dropdown-menu__item:hover{
        background: #eee!important;
        color: #666!important;
    }
    .gj-en .el-dropdown-menu__item{
        letter-spacing: normal!important;
    }
</style>
<style lang="less">
    .gante_edit_input_liu {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border: 1px solid #00b0ff;
        padding: 0 5px;
        font-size: 14px;
        z-index: 1000;
    }

    .cell-value {
        position: relative;
        width: calc(100% - 5px);
        line-height: 40px;
        cursor: default;
        display: inline-block;
        height: 40px;
        box-sizing: border-box;
        .op-one{
            height: 20px;
        }
    }

    .cell{
        .add-op{
            position: absolute;
            display: none;
            right: 0;
            top: 0;
            background: rgba(246, 246, 246);
            padding-right: 10px;
            cursor: pointer;
            span{
                font-weight: bold;
            }
            &:hover{
                color: #3396fb;
            }
        }
        .trigger {
            position: absolute;
            left: -14px;
            width: 10px;
            line-height: 40px;
            text-indent: 0;
            margin-right: 2px;
            cursor: pointer;
            .open-icon {
                transform: rotate(0);
                transition: transform .1s ease, color .1s ease;
                color: #bfbfbf;
                &:after{
                    display: block;
                    content: "";
                    width: 0;
                    height: 0;
                    border-top: 5px solid #bfbfbf;
                    border-right: 5px solid transparent;
                    border-left: 5px solid transparent;
                }
            }
            &:hover .open-icon{
                color: #999;
            }
        }
        .spot{
            width: 4px;
            height: 4px;
            position: absolute;
            left: -10px;
            top: 50%;
            margin-top: -2px;
            border-radius: 50%;
            background: #3396fb;
        }
    }
    .gj_hover_class{
        .add-op{
            display: block;
        }
    }
</style>
