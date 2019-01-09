<template>
  <div  class="gante-tr-box">
    <div class="gante-tr-one" v-for="(tr,index) in data">
      <div class="gante-tr">
        <div class="gante-td" v-for="(th,key) in th_data">
          <td-cell @change-calendar="change_calendar" @on-click="onclick" @change="change" :td_data="tr" :index="index" :key_value="key" :th="th"></td-cell>
        </div>
      </div>
      <gante-tr v-if="tr.children && tr.open" @change-calendar="change_calendar" @on-click="onclick" @change="change"  :all_data="all_data" :data="tr.children" :th_data="th_data"></gante-tr>
    </div>
  </div>
</template>
<script>
  import tdCell from './gante-table-td.vue'
  export default{
    name:'gante-tr',
    props:{
      all_data:Array,
      data:Array,
      th_data:Object,
    },
    components:{
      tdCell
    },
    methods:{
      change(data){
        this.$emit('change',data)
      },
      onclick(data){
        this.$emit('on-click',data)
      },
      change_calendar(data){
        this.$emit('change-calendar',data)
      }
    }
  }
</script>
