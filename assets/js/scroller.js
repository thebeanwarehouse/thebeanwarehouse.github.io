var randomBetween = function(a, b) {
    return a + Math.random() * (b - a);
}

// Remove text and repopulate with independent words
var $interestScroller = $("#interest-scroller");
var interests = $interestScroller.text().trim().split(", ")
$interestScroller.text("")

// Most everything related to these moving interest items is in percentages
var interestModel = [];
var INTEREST_MIN_X_VELOCITY = 20, //px per second
    INTEREST_MAX_X_VELOCITY = 40, //px per second
    INTEREST_MIN_X_POSITION = -100, //px
    INTEREST_MAX_X_POSITION = window.innerWidth + 100, //px
    INTEREST_MIN_Y_POSITION = 0, //px
    INTEREST_MAX_Y_POSITION = 250, //px
//     LAYOUT_HORIZ_SPACING_TIME = 100, //seconds guaranteed between interest collision initially
//     LAYOUT_HORIZ_SPACING_DISTANCE = 200, //px guaranteed between interest at spawn
    ROW_ARRAY = [],
    NUM_ROWS = 16; // Number of rows to lay out the interests

for(var r = 0; r < NUM_ROWS; r++) {
    ROW_ARRAY.push({v:0,i:0});
}

var largestV = function(a, b){
    return b.v - a.v;
}
var repositionItem = function(modelItem){
    modelItem.xVelocity = randomBetween(INTEREST_MIN_X_VELOCITY, INTEREST_MAX_X_VELOCITY);
    modelItem.xPosition = (modelItem.xPosition - INTEREST_MIN_X_POSITION) %
                          (INTEREST_MAX_X_POSITION - INTEREST_MIN_X_POSITION) +
                          INTEREST_MIN_X_POSITION
    for(var r = 0; r < ROW_ARRAY.length; r++) {
        ROW_ARRAY[r].v = INTEREST_MAX_X_POSITION + Math.random()*0.01;
        ROW_ARRAY[r].i = r;
    }

    for(var i = 0; i < interestModel.length; i++) {
        var otherModelItem = interestModel[i];
        if(otherModelItem === modelItem){
            continue;
        }
//         console.log(otherModelItem.yPosition)
        var rowInd = Math.floor( ROW_ARRAY.length *
                        (otherModelItem.yPosition - INTEREST_MIN_Y_POSITION) /
                        (INTEREST_MAX_Y_POSITION - INTEREST_MIN_Y_POSITION + 1)
                     )
        ROW_ARRAY[rowInd].v = Math.min(ROW_ARRAY[rowInd].v, otherModelItem.xPosition + Math.random()*0.01);
    }
    
    ROW_ARRAY.sort(largestV);
//     console.log(ROW_ARRAY);
//     modelItem.xPosition = Math.min(modelItem.xPosition, ROW_ARRAY[0].v - Math.max(0, modelItem.xVelocity - otherModelItem.xVelocity) * LAYOUT_HORIZ_SPACING_TIME) - LAYOUT_HORIZ_SPACING_DISTANCE;
    modelItem.yPosition = 1+(ROW_ARRAY[0].i / ROW_ARRAY.length) *
                  (INTEREST_MAX_Y_POSITION - INTEREST_MIN_Y_POSITION) +
                  INTEREST_MIN_Y_POSITION;


//     for(var t = 0; t < MAX_PLACEMENT_TRIES; t++){
//         modelItem.yPosition = randomBetween(INTEREST_MIN_Y_POSITION, INTEREST_MAX_Y_POSITION);

//         var placementUsable = true;
//         if(placementUsable){
//             break;
//         }
//         else{
//             modelItem.xPosition += PLACEMENT_RETRY_RETRACT;
//         }
//     }
//     console.log(t)
};
var incrementModel = function(deltaTime){
    for(var i = 0; i < interestModel.length; i++) {
        var modelItem = interestModel[i];
        modelItem.xPosition += modelItem.xVelocity * deltaTime / 1000;
    }
}
var collideModel = function(){
    for(var i = 0; i < interestModel.length; i++) {
        var modelItem = interestModel[i];
        if(modelItem.xPosition > INTEREST_MAX_X_POSITION) {
            repositionItem(modelItem);
        }
    }
}
var renderModel = function(){
    for(var i = 0; i < interestModel.length; i++) {
        var modelItem = interestModel[i];
        modelItem.interestElem
            .css("transform", "translate(" + 
                modelItem.xPosition.toFixed(3) + 
                "px, " +
                modelItem.yPosition.toFixed(3) +
                "px)");
    }

}
// Repopulate elements that are now single interests
for(var i = 0; i < interests.length; i++) {
    var interest = interests[i];
    var interestElem = $("<div></div>")
        .attr("class", "interest-item")
//         .attr("id", "interest-item-" + i)
        .text(interest)
    interestElem
        .appendTo($interestScroller)
    var modelItem = {
        xPosition: 0,
        yPosition: 0,
        xVelocity: 0,
        interestElem: interestElem
    };
    incrementModel(1000);
    interestModel.push(modelItem);
    repositionItem(modelItem);
}

var $window = $(window);

// Viewport checking

var $home = $("#home");
var $navbackground = $("#navbackground");

var previousNavbackgroundHeight = null;
var _homeHeight, _interestScrollerTop, _interestScrollerBottom;
var updateCachedVariables = function(){
     _homeHeight = $home.height();
     _interestScrollerTop = $interestScroller.offset().top;
     _interestScrollerBottom = _interestScrollerTop + $interestScroller.height();
}
updateCachedVariables();
$window.on("resize", updateCachedVariables);

var interestScrollerInView = function(scrollFromTop) {
    return (_interestScrollerTop <= scrollFromTop + window.innerHeight) && (_interestScrollerBottom >= scrollFromTop);
}

var active = interestScrollerInView($window.scrollTop());

$window.on("scroll", function(){
    var scrollFromTop = $window.scrollTop();

    var newActiveValue = interestScrollerInView(scrollFromTop);
    if(newActiveValue == true && active == false){
        active = true;
        render();
    }
    active = newActiveValue;
    
    var newNavbackgroundHeight = Math.min(Math.max(_homeHeight - scrollFromTop, 0), 300)
    if(newNavbackgroundHeight != previousNavbackgroundHeight){
        $navbackground.css("transform", "translate(0px, "+newNavbackgroundHeight+"px)");
        previousNavbackgroundHeight = newNavbackgroundHeight;
    }
    // Header code
    
})

// Rendering and looping
var raf = window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(f) {setTimeout(f, 16)};

var lastRenderTime = Date.now();

var render = function(){
    if(active){
        raf(render);
        var deltaTime = Date.now() - lastRenderTime;
        lastRenderTime += deltaTime;
        deltaTime = Math.min(1000, deltaTime);

        INTEREST_MAX_X_POSITION = window.innerWidth + 100;
        incrementModel(deltaTime);
        collideModel();
        renderModel();
    //     console.log("hello");
    }
}
render();

