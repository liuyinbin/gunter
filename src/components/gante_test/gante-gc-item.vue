<!--整体条块，同级任务-->
<template>
    <div class="ganteview-content">
        <div v-for="(item,index) in gante_data" :key="index" class="ganteview-ones">
            <div  class="ganteview-content-one" :class="{gj_hover_class: item.is_hover}" @mouseenter="enterTr($event,item)"
                 @mouseleave="leaveTr($event,item)">
                <ganteGcItemContent :start_time="start_time" :end_time="end_time" :current_data="item" :index="index" :th_data="th_data" :time_1px="time_1px" :time_mode = 'time_mode'></ganteGcItemContent>
                <!--<ganteDragCircle :current_data="item"></ganteDragCircle>-->
            </div>
            <ganteview-item v-show="item.open" :start_time="start_time" :end_time="end_time" v-if="item.children" :th_data="th_data" :time_1px="time_1px" :time_mode="time_mode" :gante_data="item.children">
                <span style="display: none">1</span>
            </ganteview-item>
        </div>
        <slot></slot>

    </div>
</template>
<script>
    import ganteGcItemContent from './gante-gc-item-content'
    // import ganteDragCircle from './gante-drag-circle'
    export default {
        name: 'ganteview-item',
        components:{
            ganteGcItemContent
        },
        data() {
            return {
                canAnimation: false,
                bol: false,
            }
        },
        props: {
            gante_data: Array,
            th_data: Object,
            time_1px:Number, // 1px代表的时间
            time_mode:[Number,String],
            start_time: {}, //开始时间
            end_time: {},
        },
        methods: {
            // 进入到了tr上
            enterTr(ev, tr) {
                this.$set(tr, 'is_hover', true)
            },
            // 离开了tr
            leaveTr(ev, tr) {
                this.$set(tr, 'is_hover', false)
            },

        }
    }
</script>
<style scoped lang="less">
    .ganteview-content {
        position: relative;
        .ganteview-ones-seat{
            height: 41px;
            line-height: 40px;
        }
    }

    .ganteview-content-one {
        height: 41px;
        box-sizing: border-box;
        line-height: 40px;
        /*border-bottom: 1px solid #ebeef5;*/
        position: relative;
        z-index: 1;
    }
    .ganteview-content-one.gj_hover_class{
        background: rgba(246, 246, 246, 0.7);
    }

</style>
