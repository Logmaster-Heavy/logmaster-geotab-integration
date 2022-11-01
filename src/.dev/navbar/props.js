const config = require('../../app/config.json');
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
         submenuItems: [
                {
                    name: config.items[0].url,
                    labelText: config.items[0].menuName,
                },
                {
                    name: config.items[1].url,
                    labelText: config.items[1].menuName,
                }
            ]
    },
    
    
    
    
    
     
];

module.exports = props;