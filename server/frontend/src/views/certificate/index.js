import api from '@/api/image'
import db from '@/api/db'
import moment from 'moment';
import { mapGetters } from 'vuex'
import {getToken} from '@/utils/auth';

export default {
  name: "certificate-page",
  computed: {
    ...mapGetters([
      'info'
    ])
  },
  data() {
    return {
      hospital:null,
      certificateMeta: {}
    };
  },
  methods: {
    async init(){
      this.hospital = await db.selectOne("hospital",{hospital_id:this.$route.params.hospitalId})
      this.certificateMeta = {
        tableName: "v_certificate",
        delete:false,
        update:false,
        definedFieldList: [
          {name: "certificate_id", label: "#", width: 300, insert: false, update:false, list: false, identity: true},
          {name: "user_id", label: "User Id",list: false, insert: false, update:false, default: this.info.user_id},
          {name: "hospital_id", label: "Hospital Id",list: false, insert: false, update:false, default: this.hospital.hospital_id},
          {name: "display_name", label: "User Name",insert: false, update:false,},
          {name: "hospital_name", label: "Hospital Name", list: false ,insert: false, update:false},
          {name: "start_date", label: "Start Date" , control:{type:"date-picker",placeholder:"Start Date"}, formatter: this.$functions.dateFormat.dateTime, rules:[{required:true,message:"Start date is required"}]},
          {name: "expire_date", label: "Expire Date", control:{type:"date-picker",placeholder:"Expire Date"},formatter: this.$functions.dateFormat.dateTime, rules:[{required:true,message:"Expire date is required"},{validator:this.expireDateValidate,trigger:'blur'}] },
          {name: "date_registered", label: "Date Registered", width: 140, formatter: this.$functions.dateFormat.dateTime, insert: false, update:false},
        ],
        api: {
          insertTableName: "certificate",
          select: async () => {
            let updatedField = {"$where": {hospital_id: this.$route.params.hospitalId}};
            return await db.select("v_certificate",{q:JSON.stringify(updatedField)});
          },
        },
        actionList: [
          {
            type:"primary",
            icon:"el-icon-download",
            click:(row)=>{
              window.open(`/api/content/certificate/${row.certificate_id}?t=${getToken()}`);
            }
          }
        ]
      }
    },
    add(){
      this.$refs.certificateTable.insertDialogFormVisible = true;
    },
    expireDateValidate(rule, value, callback){
      const startDate = _.get(this.$refs.certificateTable,"newItem.start_date") || _.get(this.$refs.certificateTable,"selectedItem.start_date")
      if (value <= startDate){
        return callback(new Error("Expire date must greater then start date"))
      }
      callback();
    }
  },
  mounted() {
    this.$nextTick(this.init);
  }
};
