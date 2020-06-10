import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        dragInfo:{
            mouseDown: null,
            taskId: null,
            offsetTop: null,
            right: null,
            startData: null,
        }, // 拖动的信息
        currentInfo: {}, // 当前拖动到的圆点的数据
        lineList:[], // 前置任务线的数组
        beforeTaskInfoListState:[], // 保存前置任务关系数组
        dashLine: {} // 当前拖动的指示线的信息
    },
    mutations: {
        SET_DRAG_INFO(state,data){
            if(data.mode == 1){
                state.dragInfo = {
                    mouseDown: null,
                    taskId: null,
                    offsetTop: null,
                    right: null,
                    startData: null
                }
            }else{
                Object.assign(state.dragInfo,data.data);
            }
        },
        SET_CURRENT_INFO(state,data){
            state.currentInfo = data
        },
        SET_LINELIST(state,data){
            state.lineList = data;
        },
        SET_BEFORE_TASK_INfO_LIST(state,data){
            state.beforeTaskInfoListState = data;
        },
        SET_DASHLINE(state,data){
            if(data.mode == 1){
                state.dashLine = {}
            }else{
                let _data = JSON.parse(JSON.stringify(state.dashLine));
                Object.assign(_data,data.data);
                state.dashLine = _data;
                // Object.assign(state.dashLine,data.data);
                // console.log(state.dashLine)
            }
        }
    }
})
export default store