const fs = require('fs');

updateProjects();

document.querySelector('.newBtn').addEventListener('click', () => {
    document.querySelector('#selectMaterialsBg').style.display = 'block';
    for (const item of JSON.parse(fs.readFileSync('items.json'))) {
        document.querySelector('.mats').innerHTML += `<label for="${item.name}"><input type="number" name="${item.name}" value="0" class="materialInput" max="99" min="0"><img src="${item.img}"></label><br>`;
    }
    document.querySelector('.mats').innerHTML += `<button class="done" id="submitProject" type="button">✅</button>`;
    document.querySelector('#submitProject').addEventListener('click', () => {
        let pFile = JSON.parse(fs.readFileSync('projects.json'));
        let p = [];
        document.querySelectorAll('.materialInput').forEach(item => {
            if (item.value === '') {
                item.value = '0';
            }
            const val = parseInt(item.value);
            if (val > 0) {
                p.push({
                    name: item.name,
                    amount: val
                });
            }
        });
        let id = fs.readFileSync('id.txt');
        id++;
        pFile.push({ id: id, materials: p });
        fs.writeFileSync('id.txt', id);

        fs.writeFileSync('projects.json', JSON.stringify(pFile));
        document.querySelector('.mats').innerHTML = '';
        document.querySelector('#selectMaterialsBg').style.display = 'none';
        location.reload();
    });
});

function updateProjects() {
    const projects = JSON.parse(fs.readFileSync('projects.json'));
    const items = JSON.parse(fs.readFileSync('items.json'));
    document.querySelector('#projects').innerHTML = '';
    for (const project of projects) {

        const newProjectDiv = document.createElement('div');
        newProjectDiv.classList.add('project');
        newProjectDiv.setAttribute('data-id', project.id);

        const newMaterialsDiv = document.createElement('div');
        newMaterialsDiv.classList.add('materials');

        for (const material of project.materials) {
            const newMaterialDiv = document.createElement('div');
            newMaterialDiv.classList.add('material');

            const newImg = document.createElement('img');
            newImg.src = `images/${material.name}.png`;

            const newP = document.createElement('p');
            newP.innerHTML = `${material.name} <span class="amount">x${material.amount}</span>`;

            newMaterialDiv.appendChild(newImg);
            newMaterialDiv.appendChild(newP);
            
            const itemIndex = items.findIndex(item => {
                return item.name == material.name;
            });

            if (items[itemIndex].inStorage >= material.amount) {
                newMaterialDiv.classList.add('enough');
            }

            newMaterialsDiv.appendChild(newMaterialDiv);
        }
        newProjectDiv.appendChild(newMaterialsDiv);

        const newDoneBtn = document.createElement('button');
        newDoneBtn.classList.add('done');
        newDoneBtn.innerHTML = '✅';
        newDoneBtn.addEventListener('click', () => { donebtn(project.id) });

        const newDeleteBtn = document.createElement('button');
        newDeleteBtn.classList.add('delete');
        newDeleteBtn.innerHTML = '🚮';
        newDeleteBtn.addEventListener('click', () => { delbtn(project.id) });

        newProjectDiv.appendChild(newDoneBtn);
        newProjectDiv.appendChild(newDeleteBtn);

        document.querySelector('#projects').appendChild(newProjectDiv);
    }

    let reqItems = {};

    for (const project of projects) {
        for (const material of project.materials) {
            if (!reqItems[material.name]) {
                reqItems[material.name] = 0;
            }
            reqItems[material.name] += material.amount;
        }
    }
    for (const item of items) {
        if (Object.keys(reqItems).includes(item.name)) {
            reqItems[item.name] -= item.inStorage;
        }
        if (reqItems[item.name] < 1) {
            delete reqItems[item.name];
        } else if (reqItems[item.name] > 0) {
            const materialDiv = document.createElement('div');
            materialDiv.classList.add('material');
            materialDiv.innerHTML = `<img src="${item.img}"><p>${item.name} <span class="amount">x${reqItems[item.name]}</span></p>`;
            document.querySelector('#allNeededMats').appendChild(materialDiv);
        }
    }
}

function donebtn(id) {
    const projects = JSON.parse(fs.readFileSync('projects.json'));
    const items = JSON.parse(fs.readFileSync('items.json'));

    const projectIndex = projects.findIndex(project => {
        return project.id == id;
    });
    
    for (const material of projects[projectIndex].materials) {
        const itemIndex = items.findIndex(item => {
            return item.name == material.name;
        });

        if (items[itemIndex].inStorage >= material.amount) {
            items[itemIndex].inStorage -= material.amount;
        } else {
            return;
        }
    }

    fs.writeFileSync('items.json', JSON.stringify(items));
    fs.writeFileSync('projects.json', JSON.stringify(projects));

    delbtn(id);
}

function delbtn(id) {
    const projects = JSON.parse(fs.readFileSync('projects.json'));

    const index = projects.findIndex(project => {
        return project.id == id;
    });
    projects.splice(index, 1);
    fs.writeFileSync('projects.json', JSON.stringify(projects));
    location.reload();
}

for (const item of JSON.parse(fs.readFileSync('items.json'))) {
    const newItemDiv = document.createElement('div');
    newItemDiv.classList.add('item');
    newItemDiv.innerHTML = `<img src="${item.img}"><p>${item.name}</p><input type="number" min="0" value="${item.inStorage}">`;

    document.querySelector('#storage #items').appendChild(newItemDiv);
}

document.querySelector('button#setStorage').addEventListener('click', () => {
    document.querySelectorAll('#storage #items .item input[type="number"]').forEach(item => {
        const items = JSON.parse(fs.readFileSync('items.json'));
        const itemIndex = items.findIndex(i => {
            return i.name == item.parentElement.querySelector('p').innerHTML;
        });
        items[itemIndex].inStorage = parseInt(item.value);
        fs.writeFileSync('items.json', JSON.stringify(items));
    });
    location.reload();
});