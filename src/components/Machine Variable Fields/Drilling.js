export const Drilling = {
    ConventionalDrillingMachine: [
        { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Enter Brand', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'model', label: 'Model', type: 'text', placeholder: 'Enter Model', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'yearOfPurchase', label: 'Year of Purchase', type: 'text', placeholder: 'Enter year of purchase', pattern: /^[0-9]{4}$/, maxLength: 4 },
        { name: 'type', label: 'Type', type: 'select', placeholder: "Please choose type", options: [{ value: 'Bench', label: 'Bench' }, { value: 'Pillar', label: 'Pillar' }, { value: 'Column Type', label: 'Column Type' }, { value: 'Deep Hole', label: 'Deep Hole' }] },
        { name: 'max_diameter_drill_in_mm', label: 'Max Diameter of the Drill', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'max_length_in_mm', label: 'Max Length', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'spindle_taper', label: 'Spindle Taper', type: 'text', placeholder: "Dimension in MT3", pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'no_of_spindle_speeds', label: 'No Of Spindle Speeds', type: 'text', placeholder: "Enter in number", pattern: /^[0-9]{0,4}$/, maxLength: 4 },
        { name: 'spindle_travel', label: 'Spindle Travel', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'type_of_feed', label: 'Type Of Feed', type: 'select', placeholder: "Please choose type", options: [{ value: 'Manual', label: 'Manual' }, { value: 'CNC', label: 'CNC' }] },
        { name: 'taping_possible', label: 'Taping Possible', type: 'select', placeholder: "Please choose type", options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }] },
        { name: 'ppk', label: 'PPK', type: 'text', placeholder: "Enter in number", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },

        { name: 'machineHourRate', label: 'Machine Hour Rate', type: 'text', placeholder: "Enter machine hour rate in Rupees", pattern: /^((?:[1-9]\d{0,4}|\d{1,5}\.\d{1,2})|\.\d{1,2})$/, maxLength: 8 },
        { name: 'noOfMachines', label: 'No. Of Machines', type: 'text', placeholder: "Enter no. of machine", pattern: /^(?:[1-9]\d{0,2})$/,maxLength: 3 },
    ]
}