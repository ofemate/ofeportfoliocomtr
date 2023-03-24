$().fancybox({
    selector : '.grid-item:not(.isotope-hidden) a',
    loop: false,
    animationEffect: "fade",
    animationDuration: 300,
    transitionEffect: "fade",
    buttons: [
      'slideShow',
      'fullScreen',
      'thumbs',
      'close'
    ],
    thumbs : {
      autoStart : true,
      axis      : 'y'
    },
    hash: true
  });
  