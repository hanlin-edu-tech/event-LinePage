function slide(){
  $(".shadow_r1").velocity({
    width: ["0%","easeInOutQuart","100%"],
  },{
    duration: 1000,
    delay: 400
  })
  $(".shadow_r2").velocity({
    height: ["0%","easeInOutQuart","100%"],
  },{
    duration: 1000,
    delay: 1000
  })
  $(".shadow_m").velocity({
    height: ["0%","easeInOutQuart","100%"],
  },1000)
  $(".shadow_mb").velocity({
    height: ["0%","easeInOutQuart","100%"],
  },{
    duration: 1000,
    delay: 300
  })
  
  $(".shadow_r5").velocity({
    width: ["0%","easeInOutQuart","100%"],
  },{
    duration: 1000,
    delay: 1000
  })
  
  $(".shadow_r7").velocity({
    height: ["0%","easeInOutQuart","100%"],
  },{
    duration: 1000,
    delay: 1400
  })
  $(".shadow_r8").velocity({
    height: ["0%","easeInOutQuart","100%"],
  },{
    duration: 600,
    delay: 600
  })
}

function messange(){
  $(".rect6").velocity({
    scale: ["1.05","easeInOutQuart","0"]
  },{
    duration: 700,
    delay: 2100
  })
  $(".rect6").velocity({
    scale: ["1","easeInOutQuart","1.05"]
  },{
    duration: 300
  })
}

function showup(){
  $(".title").velocity({
    scaleY: ["1.02","easeOutQuint","0"]
  },{
    duration: 650,
    delay: 2300
  })
  $(".title").velocity({
    scaleY: ["1","easeOutQuint","1.02"]
  },200)
}

showup();
slide();
messange();