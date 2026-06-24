items = [
    {"num": 1, "img": "../stove.png", "name": "The stove", "grid": "1 / 1 / 2 / 2", "ans": "H", "input_pos": "right-side", "color": "#9b51e0"},
    {"num": 2, "img": "assets/sofa.png", "name": "The sofa", "grid": "1 / 2 / 2 / 3", "ans": "D", "input_pos": "right-side", "color": "#f2994a"},
    {"num": 3, "img": "assets/shower.png", "name": "The shower", "grid": "1 / 3 / 2 / 4", "ans": "B", "input_pos": "right-side", "color": "#6fcf97"},
    {"num": 4, "img": "assets/car.png", "name": "The car", "grid": "1 / 4 / 2 / 5", "ans": "G", "input_pos": "right-side", "color": "#2d9cdb"},
    
    {"num": 14, "img": "../study-desk.png", "name": "A study desk", "grid": "2 / 1 / 3 / 2", "ans": "E", "input_pos": "right-side", "color": "#2d9cdb"},
    {"num": 5, "img": "assets/cupboard.png", "name": "The cupboard", "grid": "2 / 4 / 3 / 5", "ans": "H", "input_pos": "left-side", "color": "#f2994a"},
    
    {"num": 13, "img": "assets/bed.png", "name": "The bed", "grid": "3 / 1 / 4 / 2", "ans": "A", "input_pos": "right-side", "color": "#f2c94c"},
    {"num": 6, "img": "assets/wardrobe.png", "name": "The wardrobe", "grid": "3 / 4 / 4 / 5", "ans": "A", "input_pos": "left-side", "color": "#2d9cdb"},
    
    {"num": 12, "img": "assets/dining-table.png", "name": "The dining table", "grid": "4 / 1 / 5 / 2", "ans": "F", "input_pos": "right-side", "color": "#6fcf97"},
    {"num": 7, "img": "assets/washing-machine.png", "name": "The washing machine", "grid": "4 / 4 / 5 / 5", "ans": "C", "input_pos": "left-side", "color": "#9b51e0"},
    
    {"num": 11, "img": "assets/bycicle.png", "name": "The bike", "grid": "5 / 1 / 6 / 2", "ans": "G", "input_pos": "top-right", "color": "#2d9cdb"},
    {"num": 10, "img": "assets/television.png", "name": "The television", "grid": "5 / 2 / 6 / 3", "ans": "D", "input_pos": "top-right", "color": "#eb5757"},
    {"num": 9, "img": "assets/book-shelf.png", "name": "The bookshelf", "grid": "5 / 3 / 6 / 4", "ans": "E", "input_pos": "top-right", "color": "#6fcf97"},
    {"num": 8, "img": "assets/wastafel.png", "name": "The sink", "grid": "5 / 4 / 6 / 5", "ans": "B", "input_pos": "top-left", "color": "#f2994a"}
]

html = ""
for item in items:
    html += f"""
                    <div class="item-box" style="grid-area: {item['grid']}; border-color: {item['color']};">
                        <div class="item-num" style="background: {item['color']};">{item['num']}</div>
                        <img src="{item['img']}" alt="Question {item['num']}">
                        <div class="item-name">{item['name']}</div>
                        <input type="text" class="letter-input {item['input_pos']}" data-answer="{item['ans']}" maxlength="1">
                    </div>"""
print(html)
