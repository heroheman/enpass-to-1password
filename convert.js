const fs = require('fs');
const args = process.argv;
const inputFile = args[2] || 'vault.json';
const outputFile = args[3] || 'vault.csv';

console.log('\nREADING: ' + inputFile + '\n');

try {
    const contents = fs.readFileSync(inputFile);
    const vault = JSON.parse(contents);
    let notConverted = 0;
    let converted = 0;

    const csvOutput = ['title,website,username,password,notes,category'];
    const fieldMapping = {
        title: 'title',
        url: 'website',
        username: 'username',
        password: 'password',
        notes: 'notes',
        category: 'category'
    };

    vault.items.forEach(item => {
        if (
            item.category === 'login'
            || item.category === 'password'
            || item.category === 'uncategorized'
        ) {
            const rowData = {
                title: item.title,
                website: '',
                username: '',
                password: '',
                notes: item.note,
                category: item.category
            };

            Object.keys(fieldMapping).forEach(type => {
                const key = fieldMapping[type];
                if (item.fields !== undefined) {
                    item.fields.forEach(field => {
                        if (field.type === type) {
                            if (field.value && !rowData[key]) {
                                if (field.value === 'url') {
                                    rowData['website'] = '"' + field.value + '"'; 
                                } else {
                                    rowData[key] = '"' + field.value + '"';
                                }
                            }
                        }
                    });
                } 
            });

            csvOutput.push(
                Object.keys(rowData)
                .map(key => rowData[key])
                .join(','),
            );

            converted++
        } else {
            notConverted++
            console.log('NOT CONVERTED: ', item.title, ' - ', item.category)
        }
    });

    console.log('WRITING: ' + outputFile + '\n');
    console.log('SUCCESSFUL: ', converted, ' items. ')
    console.log('FAILED: ', notConverted, ' items. ')
    fs.writeFileSync(outputFile, csvOutput.join('\n'));
} catch (err) {
    throw err;
}
