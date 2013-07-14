var paper, zpd, logged_in;
var WIDTH, HEIGHT, CENTER_X, CENTER_Y;
var center, previousNode, node_list;

var filledCloud = "M24.345,13.904c0.019-0.195,0.03-0.392,0.03-0.591c0-3.452-2.798-6.25-6.25-6.25c-2.679,0-4.958,1.689-5.847,4.059c-0.589-0.646-1.429-1.059-2.372-1.059c-1.778,0-3.219,1.441-3.219,3.219c0,0.21,0.023,0.415,0.062,0.613c-2.372,0.391-4.187,2.436-4.187,4.918c0,2.762,2.239,5,5,5h15.875c2.762,0,5-2.238,5-5C28.438,16.362,26.672,14.332,24.345,13.904z";
var emptyCloud = "M7.562,24.812c-3.313,0-6-2.687-6-6l0,0c0.002-2.659,1.734-4.899,4.127-5.684l0,0c0.083-2.26,1.937-4.064,4.216-4.066l0,0c0.73,0,1.415,0.19,2.01,0.517l0,0c1.266-2.105,3.57-3.516,6.208-3.517l0,0c3.947,0.002,7.157,3.155,7.248,7.079l0,0c2.362,0.804,4.062,3.034,4.064,5.671l0,0c0,3.313-2.687,6-6,6l0,0H7.562L7.562,24.812zM24.163,14.887c-0.511-0.095-0.864-0.562-0.815-1.079l0,0c0.017-0.171,0.027-0.336,0.027-0.497l0,0c-0.007-2.899-2.352-5.245-5.251-5.249l0,0c-2.249-0.002-4.162,1.418-4.911,3.41l0,0c-0.122,0.323-0.406,0.564-0.748,0.63l0,0c-0.34,0.066-0.694-0.052-0.927-0.309l0,0c-0.416-0.453-0.986-0.731-1.633-0.731l0,0c-1.225,0.002-2.216,0.993-2.22,2.218l0,0c0,0.136,0.017,0.276,0.045,0.424l0,0c0.049,0.266-0.008,0.54-0.163,0.762l0,0c-0.155,0.223-0.392,0.371-0.657,0.414l0,0c-1.9,0.313-3.352,1.949-3.35,3.931l0,0c0.004,2.209,1.792,3.995,4.001,4.001l0,0h15.874c2.209-0.006,3.994-1.792,3.999-4.001l0,0C27.438,16.854,26.024,15.231,24.163,14.887L24.163,14.887";
   
var optionBubble = "M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z";

function setup() {
    var center = paper.path(filledCloud).attr({fill: "#333", stroke: "none"});
    center.transform("t"+(CENTER_X-16)+","+(CENTER_Y-16)).transform("...s4,4");
    center.data("position", {x: CENTER_X, y: CENTER_Y});
    center.node.draggable = false;
    var intro_text = paper.text(CENTER_X, CENTER_Y+8, "Linalg").attr({fill: "#fff", "font-size": "16"});
    return center;
}

function addOptions(cloud) { 
   /* var options = [];

    var x_pos = cloud.data("position").x + (16*3);
    var y_pos = cloud.data("position").y - (16*3);
//    options[] = paper.path(optionBubble).attr({fill: "#00A0B0", stroke: "none"}).transform("t"+x_pos+","+y_pos).transform("...s2,2").transform("...r-20");
  //  options[0].node.draggable = false;
    var text = paper.text(x_pos+16, y_pos + (16*3)/2, title).attr({fill: "#fff"});
    
    var x_pos = cloud.data("position").x + (16*5);
    var y_pos = cloud.data("position").y - 8;
  //  options[] = paper.path(optionBubble).attr({fill: "#EDC951", stroke: "none"}).
        transform("t"+x_pos+","+y_pos).transform("...s2,2").transform("...");
    //options[1].node.draggable = false;*/
}

function addCloud(cloud, center, disableClick) {
    var id = cloud.id;
    var rotation = cloud.rotation;
    var title = cloud.title;
    var distance = cloud.distance;

    var x_pos = center.x + ( Math.cos(rotation * (Math.PI/180)) * distance);
    var y_pos = center.y - ( Math.sin(rotation * (Math.PI/180)) * distance);
    var node = paper.path(filledCloud).attr({fill: "#333", stroke: "none"}).
                transform("t"+x_pos+","+y_pos).transform("...s3,3")
                .data("position", {x: x_pos, y: y_pos});
    node.node.draggable = false;
    var text = paper.text(x_pos+16, y_pos + (16*3)/2, title).attr({fill: "#fff"});

    node.click(function() {
        if(logged_in) {
            addOptions(node);
        } else if(!disableClick) {
                $.get('/article/'+id+'.json', function(data){
                data = jQuery.parseJSON(data);
                console.log(data);
                $('#modal').find('.modal-header').find('h3').html(data.title);
                $('#modal').find('.modal-body').html(data.content_markdown);
                $('#modal').find('.modal-footer').find('p').html('Uppdaterad sist: '+data.updated_at);
                $('#modal').modal({
                    backdrop: true,
                    keyboard: true,
                    show: true
                });
                console.log("WHAT IS GOIN ON");
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            });
        }
    });
    return node;
}

$(document).ready(function(){
    logged_in = $(".user_info").text();
    logged_in = (logged_in.length > 0)? true: false;

    paper = Raphael("holder", "100%", "100%");
    zpd = RaphaelZPD(paper, {zoom: true, pan:true, drag: true});
    WIDTH = $('body').innerWidth();
    HEIGHT = $('body').innerHeight();
    CENTER_X = Math.floor(WIDTH/2);
    CENTER_Y = Math.floor(HEIGHT/2);
    node_list = [];

    center = setup();
    node_list.push(center);

    $.get('/article/all.json', function(data) {
        data = jQuery.parseJSON(data);
        $.each(data, function(index, value) {
            previousNode = node_list[value.parent];
            var disableClick = (value.content == "")? true : false;
            node = addCloud(value, previousNode.data("position"), disableClick);
            paper.connection(previousNode, node);
            node_list[value.id] = node;
        });
    });


/*    var id = 0;
    var node = addCloud(0, 0, "Std-värden", center.data("position"));
    var previousNode = node;
    paper.connection(center, node);

    node = addCloud(3, 0, "Limus", previousNode.data("position"));
    paper.connection(previousNode, node);
    previousNode = node;

    node = addCloud(0, 90, "Asdf", center.data("position"));
    previousNode = node;
    paper.connection(center, node);

    node = addCloud(0, 180, "Asdf", center.data("position"));
    previousNode = node;
    paper.connection(center, node);
  */  
});
