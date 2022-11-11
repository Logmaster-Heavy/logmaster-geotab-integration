const config = require('../../app/config.json');
function getItems(){
    return config.items.map(function(item) {
        return {
            name: item.url?.replace('dist', ''),
            labelText: item.menuName,
        }
    });
}
/**
 * Props item - Houses all the navbar items and submenu items
 */
const props = [
    
    
     {
         name: 'activity',
         labelText: {
             en: 'Activity'
            },
         hasSubmenu: true,
         submenuItems : getItems()
        //  submenuItems: [
        //         {
        //             name: config.items[0].url,
        //             labelText: config.items[0].menuName,
        //         },
        //         {
        //             name: config.items[1].url,
        //             labelText: config.items[1].menuName,
        //         }
        //     ]
    },
    
    
    
    
    
     
];

module.exports = props;