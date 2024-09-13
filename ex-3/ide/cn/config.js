var _config={
  _modules:{
    //The order is match to roles and words.common._modules
    _users:0,
    _companies:1,
    _departments:2,
    _projects:3,
    _versions:4,
    _modules:5,
    _tests:6,
    _trs:7,
    _system:8,
    _requirements:9
  },
  _permissionActions:{
    _readEntity:1,
    _readList:2,
    _add:4,
    _update:8,
    _delete:16,
    _sysManage:32,
    _selfCtrl:64 //If user has the permission, he always be able to handle (modify, delete) the created resources by himself.
  },
  _roles:{
    sysAdmin:{
      _defaultPermissionMap:{
        _users:1|2|4|16|32,
        _companies:1|2|4|16|32,
        _departments:0,
        _projects:0,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32,
        _requirements:0
      },
      _disableMap:{
        _users:8|64,
        _companies:8|64,
        _departments:1|2|4|8|16|32|64,
        _projects:1|2|4|8|16|32|64,
        _versions:1|2|4|8|16|32|64,
        _modules:1|2|4|8|16|32|64,
        _tests:1|2|4|8|16|32|64,
        _trs:1|2|4|8|16|32|64,
        _system:64,
        _requirements:1|2|4|8|16|32|64
      }
    },
    owner:{
      _defaultPermissionMap:{
        _users:1|2|32,
        _companies:1|8,
        _departments:1|2|4|8|16|32,
        _projects:1|2|4|8|16|32,
        _versions:1|2|4|8|16|32,
        _modules:1|2|4|8|16|32,
        _tests:1|2|4|8|16|32,
        _trs:1|2|4|8|16|32,
        _system:0,
        _requirements:1|2|4|8|16|32
      },
      _disableMap:{
        _users:4|8|16|64,
        _companies:2|4|16|32|64,
        _departments:64,
        _projects:64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:0
      }
    },
    admin:{ //only for company
      _defaultPermissionMap:{
        _users:1|2|4|32,
        _companies:1|8,
        _departments:1|2|4|8|32,
        _projects:1|2|4|8|32,
        _versions:1|2|4|8|32,
        _modules:1|2|32,
        _tests:1|2,
        _trs:1|2,
        _system:0,
        _requirements:1|2|32
      },
      _disableMap:{
        _users:8|16|64,
        _companies:2|4|16|32|64,
        _departments:64,
        _projects:64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:0
      }
    },
    manager:{
      _defaultPermissionMap:{
        _users:1|2,
        _companies:1,
        _departments:1|2|8,
        _projects:1|2|4|8,
        _versions:1|2|4|8,
        _modules:1|2|32,
        _tests:1|2,
        _trs:1|2|32,
        _system:0,
        _requirements:1|2|16|32
      },
      _disableMap:{
        _users:4|8|16|32|64,
        _companies:2|4|16|32|64,
        _departments:64,
        _projects:64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:0
      }
    },
    teamLeader:{
      _defaultPermissionMap:{
        _users:1|2,
        _companies:1,
        _departments:1|2,
        _projects:1|2,
        _versions:1|2,
        _modules:1|2|32,
        _tests:1|2|4|8|16,
        _trs:1|2|4|8|16|32,
        _system:0,
        _requirements:1|2|4|8|16|32
      },
      _disableMap:{
        _users:4|8|16|32|64,
        _companies:2|4|16|32|64,
        _departments:64,
        _projects:4|16|64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:0
      }
    },
    architect:{
      _defaultPermissionMap:{
        _users:1|2,
        _companies:1,
        _departments:1|2,
        _projects:1|2,
        _versions:1|2|4|8,
        _modules:1|2|4|8|16|32,
        _tests:1|2|4|8|16,
        _trs:1|2|4|8,
        _system:0,
        _requirements:1|2|4|8|16|32
      },
      _disableMap:{
        _users:4|8|16|32|64,
        _companies:2|4|8|16|32|64,
        _departments:4|8|16|32|64,
        _projects:4|16|64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:0
      }
    },
    qa:{
      _defaultPermissionMap:{
        _users:1|2,
        _companies:1,
        _departments:1|2,
        _projects:1|2,
        _versions:1|2,
        _modules:1|2|32,
        _tests:1|2|4|8|16,
        _trs:1|2|4|8|16|32,
        _system:0,
        _requirements:1|2
      },
      _disableMap:{
        _users:4|8|16|32|64,
        _companies:2|4|8|16|32|64,
        _departments:4|8|16|32|64,
        _projects:4|16|64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:0
      }
    },
    developer:{
      _defaultPermissionMap:{
        _users:1|2,
        _companies:1,
        _departments:1|2,
        _projects:1|2,
        _versions:1|2,
        _modules:1|2|32,
        _tests:1|2|4|8|16,
        _trs:1|2|4|8,
        _system:0,
        _requirements:1|2
      },
      _disableMap:{
        _users:4|8|16|32|64,
        _companies:2|4|8|16|32|64,
        _departments:4|8|16|32|64,
        _projects:4|16|64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:0
      }
    },
    ci:{
      _defaultPermissionMap:{
        _users:1|2,
        _companies:1,
        _departments:1|2,
        _projects:1|2,
        _versions:1|2,
        _modules:1|2,
        _tests:1|2,
        _trs:1|2,
        _system:0,
        _requirements:1|2
      },
      _disableMap:{
        _users:4|8|16|32|64,
        _companies:2|4|8|16|32|64,
        _departments:4|8|16|32|64,
        _projects:4|8|16|32|64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:4|8|16|32|64
      }
    },
    viewer:{
      _defaultPermissionMap:{
        _users:1|2,
        _companies:1,
        _departments:1|2,
        _projects:1|2,
        _versions:1|2,
        _modules:1|2,
        _tests:1|2,
        _trs:1|2,
        _system:0,
        _requirements:1|2
      },
      _disableMap:{
        _users:4|8|16|32|64,
        _companies:2|4|8|16|32|64,
        _departments:4|8|16|32|64,
        _projects:4|8|16|32|64,
        _versions:0,
        _modules:0,
        _tests:0,
        _trs:0,
        _system:1|2|4|8|16|32|64,
        _requirements:4|8|16|32|64
      }
    }
  },
  _status:{
    prepare:"prepare",
    active:"active",
    inactive:"inactive",
    archive:"archive"
  },
  _testType:{
    cell:"cell",
    bug:"bug",
    com:"com",
    unit:"unit",
    api:"api",
    "int":"int",
    scenario:"scenario"
  },
  _testSubType:{
    ctrl:"Control",
    operation:"Operation",
    validation:"Validation"
  },
  _businessType:{
    module:[null,"","auth","feature","setting","account","tools","data","group","summary"],
    test:[null,"","scenario","add","attach","edit","delete","archive","update-status","execute","other"]
  },
  _trStatus:{
    created:0,
    assigned:1,
    answered:2,
    rejected:3,
    noReproduced:4,
    noFixed:5,
    pending:6,
    pendingByClient:7,
    fixed:8,
    closed:9,
    archived:10
  },
  _requirementStatus:{
    created:0,
    assigned:1,
    working:2,
    rejected:3,
    pending:4,
    pendingByClient:5,
    completed:6,
    closed:7,
    archived:8
  }
};

const _projectSetting={
  dataVersion:"2.2",
  aiSwitchAuth:"",
  language:"",
  dateFormat:"YYYY-MM-DD",
  ymdParser:"on",
  mdParser:"mdy",
  MMM:"",
  MMMM:"",
  environments:[
    {name:"Default",items:[{name:"App",host:"",defaultRoot:""}]}
  ],
  //Mapping to environment items
  authList:[{inAuth:""}],
  aliasMap:{},
  tagFilterMap:{},
  advanced:[{
    popWindowStyle:"",
    expectReactionTime:3000,
    stepDelay:250,
    performanceReminder:2000,
    onPoorPerformance:"",
    maxRequestTime:60000,
    loadPageTime:60000,
  }],
  windowOptions:["100%","70%","60%","50%","1024","800","768 x 1024#1","375 x 812"],
  content: {
    defFailResponse:"..",
    ignoreRequest:"",
    whiteRequest:"*",
    ignorePopValidation:"",
    ignoreClasses:"ng-, active, checked, change, dirty, modify, modified, update, highlight, over, hvr, hover, cursor, show, focus, pressed, pushed, select, selected, open, desktop, mobile, col-, row-, pull-, form-control",
    contentAttribute:"title|label|placeholder|alt|name",
    clickableElements:"A,BUTTON,INPUT[type=submit],INPUT[type=reset],INPUT[type=button],INPUT[type=image]",
    loadingElement:"",
    hideDataName:"password",
    aiControlAction:"",
    aiControlActionRetry:"",
    completeActionOnRender:"",
    hiddenAsUnexist:"",
    disableAutoOneAction:"",
    ignoreRenderElement:"",
    priorityElementItems:"",
    aiApp:{
      menu:"",
      requiredField:"",
      customize:[""],
      formTab:[""]
    }
  },
  supportMSCooperationTest:"",
  appLanguages:[""],
  appWords:[],
  customizeInputs:[],
  objectLib:{
    element:[
      {key:"button",css:"BUTTON,INPUT[type=submit],INPUT[type=reset],INPUT[type=button],INPUT[type=image]"},
      {key:"link",css:"A",hide:1},
      {key:"input",css:"INPUT:not([type=image],[type=button],[type=submit],[type=reset],[type=hidden]),SELECT,TEXTAREA,[contenteditable=true]",input:1},
      {key:"textarea",css:"TEXTAREA,DIV[contenteditable=true],BODY[contenteditable=true]",hide:1,input:1},
      {key:"dropdownList",css:"SELECT",hide:1,input:1},
      {key:"checkbox",css:"INPUT[type=checkbox]",hide:1,input:1},
      {key:"radio",css:"INPUT[type=radio]",hide:1,input:1},
      {key:"file",css:"INPUT[type=file]",hide:1,input:1},
      {key:"mainHeading",css:"H1,H2,H3,.title,.caption,.subject,.modal-header"},
      {key:"subHeading",css:"H4,H5,H6"},
      {key:"panel",css:""}
    ],
    message:[
      {key:"missData",css:""},
      {key:"dataType",css:""},
      {key:"tooLong",css:""},
      {key:"tooShort",css:""},
      {key:"dataFormat",css:""},
      {key:"dataLocked",css:""},
      {key:"noResponse",css:""}
    ],
    component:[
      {key:"dropdownInput",items:[],input:1},
      {key:"rangeSlider",items:[],input:1},
      {key:"checkbox",items:[]},
      {key:"radio",items:[]},
    ],
    operation:[
      {key: "add",css: ""},
      {key: "edit",css: ""},
      {key: "delete",css: ""},
      {key: "attach",css: ""},
      {key: "archive",css: ""},
      {key: "view",css: ""},
      {key: "report",css: ""},
      {key: "enter",css: ""},
      {key: "preview",css: ""},
      {key: "submit",css: ""},
      {key: "confirm",css: ""},
      {key: "execute",css: ""},
      {key: "close",css: ""},
      {key: "cancel",css: ""},
      {key: "reset",css: ""},
      {key: "search",css: ""},
      {key: "filter",css: ""},
      {key: "next",css: ""},
      {key: "previous",css: ""}
    ],
    status:[
      {key:"active",css:".active"},
      {key:"highlight",css:".highlight"},
      {key:"required",css:".required"},
      {key:"error",css:".error"},
      {key:"warning",css:".warning"},
      {key:"success",css:".success"},
      {key:"waiting",css:""}
    ]
  },
  defaultData:[],
  service:{
    feature:{},
    trReport:{},
    screenshot:{},
    email:{},
    postReport:{format:"jk",target:"console"}
  },
  cooperation:{
    groups:[],
    scopes:[]
  }
}

const _personalSetting={
  curEnvironment:0,
  timeFormat: "hh-mi-ss",
  noAlertAIRepire:"",
  ignoreALFErr:"on",
  autoDataBind:"on",
  disableShadowRootRecording:"",
  autoMergeToSetValue:"on",
  acceptMonitor:"",
  debugOneAction:"",
  noAutoFocus:"",
  useTmpData:"no",
  speakOnRecording:"",
  infoRunningTest:"on",
  disableScreenshot:"",
  elementFilters:[{filter:"[data-bz]",chk:"on",bz:1}],
  record: {
    // autoAIValidation:"",
    // ignoreAIValidateArea:""
  },
  personalData:[],
  bookmarkList:[],
  subscriptions:[],
  monitorLog:{
    filter:"",
    attachScreenshot:""
  },
  autoSave:"",
  autoDownloadReport:{
    report:"",pfd:"",fs:"",fd:""
  },
  defaultRole:[],
  showRequestDetails:""
};
//Build _defaultPermissions for each role
(function(){
  for(var k in _config._roles){
    var v=_config._roles[k];
    v._name=k;
    var ms=_config._modules;
    v._defaultPermissions=[];
    v.disablePermissions=[];
    for(var kk in ms){
      v._defaultPermissions[ms[kk]]=v._defaultPermissionMap[kk];
      v.disablePermissions[ms[kk]]=v._disableMap[kk];
    }
    
  };
})();

try{
  exports._enum =_config;
  exports._projectSetting=_projectSetting;
}catch(e){};
var _attributeMap=[
  {key: "键",sys:1,regex:"/[0-9a-fA-F]{6,32}/",value:"键|键值|编号|卡号|卡片编号",ex:"|id|key"},
  {key: "名称",sys:1,regex:"/{module}-{timestamp}/",value:"名称|名字|姓|名|全称|用户名",ex:"name|surname|username"},
  {key: "密码",sys:1,regex:"/[a-z]{2}[A-Z]{2}[0-9]{2}[$@#%^&]{2}/",value:"密码",ex:"password|pwd"},
  {key: "序列号",sys:1,regex:"/[A-Z0-9]{1,5}((-|[.]|)[A-Z0-9]{1,5}){1,3}/",valid:"^\\d*$",value:"序列号",ex:"serial number"},
  {key: "数字",sys:1,regex:"/{random:1-100}/",value:"数字|数|号|从|到|至",ex:"number|num|no|from|to"},
  {key: "时间",sys:1,regex:"/[0-2][0-9]:[0-5][0-9]/",value:"时间",ex:"time"},
  {key: "日期",sys:1,regex:"/20[0-9]{2}-(0[1-9]|10|11|12)-([0-2][0-9]|30|31)/",value:"日期",ex:"date"},
  {key: "星期",sys:1,regex:"/星期一|星期二|星期三|星期四|星期五|星期六|星期日/",value:"星期",ex:"day"},
  {key: "价格",sys:1,regex:"/{random:0.01-1000}/",value:"价格",ex:"price"},
  {key: "数值",sys:1,regex:"/{random:1.00-100}/",value:"数值",ex:"decimal|数值|率|百分比"},
  {key: "文本",sys:1,regex:"/[\u4E00-\u9FCC]{10,30}[，][\u4E00-\u9FCC]{10,30}[。]/",value:"文本|说明|内容|注释|介绍|描述",ex:"text|comment|note|description"},
  {key: "电子邮件",sys:1,regex:"/[a-z]{3,10}@bzmail[.]com/",value:"电子邮件",ex:"email|e-mail"},
  {key: "电话号码",sys:1,regex:"/[1-9][0-9]{8}/",value:"电话号码|电话|手机|传真",ex:"phone|cell|mobile|fax"},
  {key: "地址",sys:1,regex:"/[\u4E00-\u9FCC]{3,8}[0-9]{2,3}(号)/",value:"地址",ex:"address"},
  {key: "邮政编码",sys:1,regex:"/[1-9][0-9]{5}/",value:"邮政编码",ex:"post code|postcode|zip"},
  {key: "文件",sys:1,regex:"/example\.(jpg|docx|pdf|gif|bat|css|html|js|json|odt|ogv|png|rtf|sh|txt|zip)/",value:"文件|图片|照片|附件"},
  {key: "角色",sys:1,regex:"/管理员|经理|用户|客户/",value:"角色|职务",ex:"role|position"},
  {key: "链接",sys:1,regex:"/(http|https):\\/\\/[a-z]{3,8}[.][a-z]{3,8}[.](com|org)/",value:"超级链接|链接",ex:"link|url"}
];

var _ergodicMap=[
  {
    key:"名称",
    success:"张三",
    error:[
      {value:"",message:"此为必填项"},
      {value:"33434",message:"格式化错误"}
    ]
  },
  {
    key:"身份证",
    success:"11010518931226611x",
    error:[
      {value:"",message:"此为必填项"},
      {value:"yyyyy",message:"格式化错误"}
    ]
  },
  {
    key:"手机",
    success:"1381542698",
    error:[
      {value:"",message:"此为必填项"},
      {value:"ttttt",message:"格式化错误"}
    ]
  },
  {
    key:"电话号码",
    success:"01064332657",
    error:[
      {value:"",message:"此为必填项"},
      {value:"hhhhh",message:"格式化错误"}
    ]
  },
  {
    key:"电子邮件",
    success:"abc@qq.com",
    error:[
      {value:"",message:"此为必填项"},
      {value:"abc#qq.com",message:"格式化错误"}
    ]
  },
  {
    key:"微信",
    success:"xdsdf",
    error:[
      {value:"",message:"此为必填项"},
      {value:"abc",message:"格式化错误"}
    ]
  },
  {
    key:"QQ",
    success:"123456789",
    error:[
      {value:"",message:"此为必填项"},
      {value:"xxxxx",message:"格式化错误"}
    ]
  },
  {
    key:"地址",
    success:"朝阳区酒仙桥十街坊三楼一单元8号",
    error:[
      {value:"",message:"此为必填项"}
    ]
  },
  {
    key:"邮政编码",
    success:"100006",
    error:[
      {value:"",message:"此为必填项"},
      {value:"rrr",message:"格式化错误"}
    ]
  },
  {
    key:"价格",
    success:"26.88",
    error:[
      {value:"",message:"此为必填项"},
      {value:"xyz",message:"格式化错误"}
    ]
  },
  {
    key:"数量",
    success:"5",
    error:[
      {value:"",message:"此为必填项"},
      {value:"abc",message:"格式化错误"}
    ]
  }
]

var _dictionaryConfig={
  ignore:"个|只|件|的|了|几|我|你|他|们|这|那|哪|为什么|什么时候|什么地点|什么事情|什么东西|什么|是|干|去|做",
  operation:[
    {key: "add",sys:1,value:"添加|创建|增加|新增|add|new|create"},
    {key: "edit",sys:1,value:"编辑|修改|更新|edit|modify|update|set"},
    {key: "delete",sys:1,value:"删除|清除|移除|delete|remove|quit|del|clean"},
    {key: "attach",sys:1,value:"附加|attach|attachment"},
    {key: "archive",sys:1,value:"存档|archive"},
    {key: "view",sys:1,value:"查看|查看明细|查看详情|浏览|details|view|review"},
    {key: "report",sys:1,value:"报告|表|列表|report|list"},
    {key: "enter",sys:1,value:"$module"},
    {key: "validate",sys:1,value:"验证|检查|validate|check"},
    {key: "preview",sys:1,value:"预览|preview"},
    {key: "submit",sys:1,value:"提交|完成|保存|发出|submit|save|store|complete|done|post|send"},
    {key: "execute",sys:1,value:"开始|启动|执行|运行|go|run|start|execute|exe"},
    {key: "confirm",sys:1,value:"是|好|确认|确定|yes|ok|confirm"},
    {key: "close",sys:1,value:"关|闭|结束|close|end"},
    {key: "cancel",sys:1,value:"取消|否|cancel|no"},
    {key: "reset",sys:1,value:"重置|reset"},
    {key: "search",sys:1,value:"搜索|查找|search|find|query|looking for"},
    {key: "filter",sys:1,value:"筛选|filter"},
    {key: "next",sys:1,value:"下一步|next"},
    {key: "previous",sys:1,value:"上一步|previous|prev"}
  ],
  fun:[
    {key: "home",sys:1,value:"首页|Home"},
    {key: "sign-out",sys:1,value:"退出|登出|sign out|logout|log out"},
    {key: "sign-in",sys:1,value:"登录|sign in|login|log in"},
    {key: "has-sign",sys:1,value:"设置登录状态为"},
    {key: "sign-out-api",sys:1,value:"退出 - API"},
    {key: "sign-in-api",sys:1,value:"登录 - API"},
    {key: "sign-up",sys:1,value:"注册|创建账号|创建账户|sign up|register|create account"},
    {key: "token",sys:1,value:"得到API令牌|token"},
    {key: "sign-in-link",sys:1,value:"我是<角色>|I am <role>"},
    {key: "forgot-password",sys:1,value:"忘记密码|forgot password"},
    {key: "change-password",sys:1,value:"修改密码|change password"},
    {key: "upload",sys: 1,value:"上传|upload"},
    {key: "download",sys: 1,value:"下载|download"},
    {key: "export",sys: 1,value:"导出|export"},
    {key: "import",sys: 1,value:"导入|import"}
  ],
  info:[
    {key: "success",sys:1,value:"成功|完成|保存了|提交了|success|completed|closed|done|passed|pass|saved|stored|successful|succeed"},
    {key: "fail",sys:1,value:"失败|fail"},
    {key: "error",sys:1,value:"错误|error"},
    {key: "info",sys:1,value:"信息|消息|information|info"},
    {key: "warning",sys:1,value:"提醒|警告|warning"},
    {key: "disabled",sys:1,value:"禁用|disabled|disable"},
    {key: "enabled",sys:1,value:"启用|enabled|enable"},
    {key: "active",sys:1,value:"激活|active|activate|highlight"},
    {key: "locked",sys:1,value:"locked|lock"},
    {key: "unlocked",sys:1,value:"unlocked"},
    {key: "updated",sys:1,value:"修改了|updated|modified|changed"},
    {key: "created",sys:1,value:"添加了|created"},
    {key: "deleted",sys:1,value:"删除了|deleted|removed|cleaned|cleared"}
  ]
};

var _envNames=["缺省"]

var _scenarioSentences={
  auth:"设置登录状态为<角色>",
  given:"#test-description/#test-name： #parameter-list",
  when:"#test-description/#test-name： #parameter-list",
  then:"#test-description/#test-name： #parameter-list",
  and:"#test-description/#test-name： #parameter-list",
  reverse:"失败于#sentence"
};
/*
var _scenarioSentences={
  auth:"设置登录状态为<角色>",
  given:"我有一个#module： #parameter-list",
  when:"#test-description/#test-name (#module)： #parameter-list",
  then:"可验证此#module： #parameter-list",
  reverse:"失败于#sentence"
};
*/
try{
//  exports._dictionaryConfig =_dictionaryConfig;
  exports._attributeMap=_attributeMap;
  exports._envNames=_envNames;
  exports._scenarioSentences=_scenarioSentences;
}catch(e){};var sysVersion='0.001';