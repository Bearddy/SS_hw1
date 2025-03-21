let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d", { willReadFrequently: true });

//controls
let draw_btn = document.getElementById('draw');
let erase_btn = document.getElementById('erase');
let clear_btn = document.getElementById('clear');
let text_btn = document.getElementById('text');

let brush_size = document.getElementById('brush_size');
let rgb_red = document.getElementById('rgb_red');
let rgb_green = document.getElementById('rgb_green');
let rgb_blue = document.getElementById('rgb_blue');
let rgb_red_value = document.getElementById('rgb_red_value');
let rgb_green_value = document.getElementById('rgb_green_value');
let rgb_blue_value = document.getElementById('rgb_blue_value');

let fonts = document.getElementById('fonts');
let font_size = document.getElementById('font_size');   

let circle = document.getElementById('circle');
let rectangle = document.getElementById('rectangle');
let line = document.getElementById('line');
let triangle = document.getElementById('triangle');

let save = document.getElementById('save');

let undo = document.getElementById('undo');
let redo = document.getElementById('redo');


//cursors
let circle_cursor = document.getElementById('circle_cursor');
let pencil_cursor = document.getElementById('pencil_cursor');
let eraser_cursor = document.getElementById('eraser_cursor');


canvas.width = 1280;
canvas.height = 720;

ctx.strokeStyle = "#000000";
ctx.lineWidth = 2;

let working = false;

// let draw_mode = true;
// let erase_mode = false;
// let text_mode = false;

const Mode = {
    DRAW: 0,
    ERASE: 1,
    TEXT: 2,
    CIRCLE: 3,
    RECTANGLE: 4,
    LINE: 5,
    TRIANGLE: 6
};

let mode = 0;


let circle_start = {x: 0, y: 0};
let rect_start = {x: 0, y: 0};
let tria_start = {x: 0, y: 0};
let line_start = {x: 0, y: 0};
let snapshot_before;

let all_snapshots = [];
let snapshot_index = 0;

let img_src;
// let mouseX = 0;
// let mouseY = 0;

window.onload = () => {
    loadFonts();
    loadFontSizes();
    takeAllSnapshots();
    changeCursorState(-1);
}

canvas.addEventListener('mousedown', e => {
    // working = true;
    
    if(mode === Mode.TEXT){
        createTextInput(e.offsetX, e.offsetY);
        working = false;
    }
    else {
        working = true;
        if(mode === Mode.ERASE){
            ctx.clearRect(e.offsetX - ctx.lineWidth/2, e.offsetY - ctx.lineWidth/2, ctx.lineWidth, ctx.lineWidth);
        }
        else if(mode === Mode.CIRCLE){
            takeSnapshot();
            circle_start.x = e.offsetX;
            circle_start.y = e.offsetY;
        }
        else if(mode === Mode.RECTANGLE){
            takeSnapshot();
            rect_start.x = e.offsetX;
            rect_start.y = e.offsetY;
        }
        else if(mode === Mode.TRIANGLE){
            takeSnapshot();
            tria_start.x = e.offsetX;
            tria_start.y = e.offsetY;
        }
        else if(mode === Mode.LINE){
            takeSnapshot();
            line_start.x = e.offsetX;
            line_start.y = e.offsetY;
        }
    }
    

});



canvas.addEventListener('mousemove', e => {
    
    if (!working){
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }
    else {
        if(mode === Mode.DRAW){
            
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
        else if(mode === Mode.ERASE){
            ctx.clearRect(e.offsetX - ctx.lineWidth/2, e.offsetY - ctx.lineWidth/2, ctx.lineWidth, ctx.lineWidth);
        }
        else if(mode === Mode.CIRCLE){
            restoreSnapshot();
            let centerX = (circle_start.x + e.offsetX) / 2;
            let centerY = (circle_start.y + e.offsetY) / 2;
            let radius = Math.sqrt(Math.pow(circle_start.x - e.offsetX, 2) + Math.pow(circle_start.y - e.offsetY, 2)) / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        else if(mode === Mode.RECTANGLE){
            restoreSnapshot();
            ctx.beginPath();
            ctx.rect(rect_start.x, rect_start.y, e.offsetX - rect_start.x, e.offsetY - rect_start.y);
            ctx.stroke();

        }
        else if(mode === Mode.TRIANGLE){
            restoreSnapshot();
            ctx.beginPath();
            ctx.moveTo(tria_start.x, tria_start.y);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.lineTo(2*tria_start.x - e.offsetX, e.offsetY);
            ctx.lineTo(tria_start.x, tria_start.y);
            ctx.closePath();
            ctx.stroke();
        }
        else if(mode === Mode.LINE){
            restoreSnapshot();
            ctx.beginPath();
            ctx.moveTo(line_start.x, line_start.y);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
        //console.log(e.offsetX, e.offsetY);
    }

    //change cursor
    if(mode === Mode.DRAW){
        pencil_cursor.style.left = e.clientX + 'px';
        pencil_cursor.style.top = e.clientY -20 + 'px';
        changeCursorState(Mode.DRAW);
    }
    else if(mode === Mode.ERASE){
        eraser_cursor.style.width = brush_size.value + 'px';
        eraser_cursor.style.height = brush_size.value + 'px';
        eraser_cursor.style.left = e.clientX - (brush_size.value / 2) + 'px';
        eraser_cursor.style.top = e.clientY - (brush_size.value / 2) + 'px';
        changeCursorState(Mode.ERASE);
    }
    else{
        circle_cursor.style.left = e.clientX - 10 + 'px';
        circle_cursor.style.top = e.clientY - 10 + 'px';
        changeCursorState(100);
    }

});



canvas.addEventListener('mouseup', () => {
    if(!working) return;
    working = false;
    takeAllSnapshots();
});

canvas.addEventListener('mouseleave', () => {
    changeCursorState(-1);
    if(!working) return;
    working = false;
    takeAllSnapshots();
});



draw_btn.addEventListener('click', () => {
    mode = Mode.DRAW;
});

erase_btn.addEventListener('click', () => {
    mode = Mode.ERASE;
});

text_btn.addEventListener('click', () => {
    mode = Mode.TEXT;
});

circle.addEventListener('click', () => {
    mode = Mode.CIRCLE;
});

rectangle.addEventListener('click', () => {
    mode = Mode.RECTANGLE;
});

line.addEventListener('click', () => {
    mode = Mode.LINE;
});

triangle.addEventListener('click', () => {
    mode = Mode.TRIANGLE;
});

clear_btn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    takeAllSnapshots();
});

brush_size.addEventListener('change', () => {
    ctx.lineWidth = brush_size.value;
});

rgb_red.addEventListener('input', () => {
    rgb_red_value.value = rgb_red.value;
    ctx.strokeStyle = `rgb(${rgb_red.value}, ${rgb_green.value}, ${rgb_blue.value})`;
});

rgb_green.addEventListener('input', () => {
    rgb_green_value.value = rgb_green.value;
    ctx.strokeStyle = `rgb(${rgb_red.value}, ${rgb_green.value}, ${rgb_blue.value})`;
});

rgb_blue.addEventListener('input', () => {
    rgb_blue_value.value = rgb_blue.value;
    ctx.strokeStyle = `rgb(${rgb_red.value}, ${rgb_green.value}, ${rgb_blue.value})`;
});


setInterval(() => {
    ctx.font = `${font_size.value}px ${fonts.value}`;
    ctx.fillStyle = `rgb(${rgb_red.value}, ${rgb_green.value}, ${rgb_blue.value})`;
}, 10);

rgb_red_value.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
        if(rgb_red_value.value > 255){
            rgb_red_value.value = 255;
        }
        else if(rgb_red_value.value < 0 || typeof(parseInt(rgb_red_value.value)) !== 'number'){
            rgb_red_value.value = 0;
        }
        
        
        rgb_red.value = parseInt(rgb_red_value.value);
        rgb_red_value.value = parseInt(rgb_red_value.value);
    }
});

rgb_red_value.addEventListener('blur', () => {
    if(rgb_red_value.value > 255){
        rgb_red_value.value = 255;
    }
    else if(rgb_red_value.value < 0 || typeof(parseInt(rgb_red_value.value)) !== 'number'){
        rgb_red_value.value = 0;
    }
    
    rgb_red.value = parseInt(rgb_red_value.value);
    rgb_red_value.value = parseInt(rgb_red_value.value);
})

rgb_green_value.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
        if(rgb_green_value.value > 255){
            rgb_green_value.value = 255;
        }
        else if(rgb_green_value.value < 0 || typeof(parseInt(rgb_green_value.value)) !== 'number'){
            rgb_green_value.value = 0;
        }
        
        rgb_green.value = parseInt(rgb_green_value.value);
        rgb_green_value.value = parseInt(rgb_green_value.value);
    }
});

rgb_green_value.addEventListener('blur', () => {
    if(rgb_green_value.value > 255){
        rgb_green_value.value = 255;
    }
    else if(rgb_green_value.value < 0 || typeof(parseInt(rgb_green_value.value)) !== 'number'){
        rgb_green_value.value = 0;
    }
    
    rgb_green.value = parseInt(rgb_green_value.value);
    rgb_green_value.value = parseInt(rgb_green_value.value);
});

rgb_blue_value.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
        if(rgb_blue_value.value > 255){
            rgb_blue_value.value = 255;
        }
        else if(rgb_blue_value.value < 0 || typeof(parseInt(rgb_blue_value.value)) !== 'number'){
            rgb_blue_value.value = 0;
        }

        rgb_blue.value = parseInt(rgb_blue_value.value);
        rgb_blue_value.value = parseInt(rgb_blue_value.value);
    }
});

rgb_blue_value.addEventListener('blur', () => {
    if(rgb_blue_value.value > 255){
        rgb_blue_value.value = 255;
    }
    else if(rgb_blue_value.value < 0 || typeof(parseInt(rgb_blue_value.value)) !== 'number'){
        rgb_blue_value.value = 0;
    }

    rgb_blue.value = parseInt(rgb_blue_value.value);
    rgb_blue_value.value = parseInt(rgb_blue_value.value);
});

save.addEventListener('click', () => {
    let link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'image.png';
    link.click();
});


undo.addEventListener('click', () => {
    if(snapshot_index > 1){
        snapshot_index--;
        getSnapshot(snapshot_index);
    }
});

redo.addEventListener('click', () => {
    if(snapshot_index < all_snapshots.length){
        snapshot_index++;
        getSnapshot(snapshot_index);
    }
});


function loadFonts(){
    let font_list = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];
    for(let i = 0; i < font_list.length; i++){
        let option = document.createElement('option');
        option.value = font_list[i];
        option.innerText = font_list[i];
        fonts.appendChild(option);
    }
}

function loadFontSizes(){
    for(let i = 8; i <= 72; i+=2){
        let option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        font_size.appendChild(option);
    }
}

function createTextInput(x, y) {
    // let existingInput = document.getElementById('canvas_text_input');
    // if (existingInput) {
    //     existingInput.remove();
    // }

    let input = document.createElement('input');
    input.type = 'text';
    input.id = 'canvas_text_input';
    input.style.position = 'absolute';
    input.style.left = `${canvas.offsetLeft + x}px`;
    input.style.top = `${canvas.offsetTop + y}px`;
    input.style.fontSize = `${font_size.value}px`;
    input.style.border = '1px solid black';
    input.style.color = `rgb(${rgb_red.value}, ${rgb_green.value}, ${rgb_blue.value})`;
    input.style.fontFamily = fonts.value;
    input.style.padding = '2px';
    input.style.zIndex = 10;
    input.style.background = 'rgba(255, 255, 255, 0)';

    console.log(input);
    
    document.body.appendChild(input);
    setTimeout(() => {
        input.focus();
    }, 0);

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });

    input.addEventListener('blur', () => {
        let text = input.value.trim();
        if (text !== "") {
            ctx.fillText(text, x, y + parseFloat(font_size.value));
        }
        takeAllSnapshots();
        input.remove();
            
    });
}

function takeSnapshot() {
    snapshot_before = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot() {
    if (snapshot_before) {
        ctx.putImageData(snapshot_before, 0, 0);
    }
}

function takeAllSnapshots(){
    if(snapshot_index < all_snapshots.length - 1){
        all_snapshots.splice(snapshot_index, all_snapshots.length - snapshot_index);
    }
    all_snapshots.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    snapshot_index++;
}

function getSnapshot(index){
    ctx.putImageData(all_snapshots[index-1], 0, 0);
}


function loadFile(input) {
    const img = new Image();
    
    img.addEventListener('load', () => {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.style.width = img.width + 'px';
        canvas.style.height = img.height + 'px';
        ctx.drawImage(img, 0, 0);
        ctx.stroke();

        all_snapshots = [];
        snapshot_index = 0;
        takeAllSnapshots();
        
    });

    img.src = URL.createObjectURL(input.files[0]);
};

function changeCursorState(index){
    if(index == Mode.DRAW){
        pencil_cursor.style.display = 'block';
        circle_cursor.style.display = 'none';
        eraser_cursor.style.display = 'none';
    }
    else if(index == Mode.ERASE){
        pencil_cursor.style.display = 'none';
        circle_cursor.style.display = 'none';
        eraser_cursor.style.display = 'block';
    }
    else if(index == 100){
        pencil_cursor.style.display = 'none';
        circle_cursor.style.display = 'block';
        eraser_cursor.style.display = 'none';
    }
    else if(index == -1){
        pencil_cursor.style.display = 'none';
        circle_cursor.style.display = 'none';
        eraser_cursor.style.display = 'none';
    }

}