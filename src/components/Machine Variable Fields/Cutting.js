export const Cutting = {
    BandSaw: [
        { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Enter Brand', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'model', label: 'Model', type: 'text', placeholder: 'Enter Model', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'yearOfPurchase', label: 'Year of Purchase', type: 'text', placeholder: 'Enter year of purchase', pattern: /^[0-9]{4}$/, maxLength: 4 },
        { name: 'type', label: 'Type', type: 'select', placeholder: "Please choose type", options: [{ value: 'Manual', label: 'Manual' }, { value: 'Automatic', label: 'Automatic' }, { value: 'Others', label: 'Others' }] },
        { name: 'max_diameter_round_in_mm', label: 'Max Diameter Round', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'max_square_in_mm', label: 'Max Square', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'cutting_speed_in_mmin', label: 'Cutting Speed', type: 'text', placeholder: "Enter in m/min", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        {
            name: 'machineHourRate', label: 'Machine Hour Rate', type: 'text', placeholder: "Enter machine hour rate in Rupees", pattern: /^((?:[1-9]\d{0,4}|\d{1,5}\.\d{1,2})|\.\d{1,2})$/
            , maxLength: 8
        },
        { name: 'noOfMachines', label: 'No. Of Machines', type: 'number', placeholder: "Enter no. of machine", pattern: /^(?:[1-9]\d{0,2})$/, maxLength: 3 },
    ],
    PowerHackSaw: [
        { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Enter Brand', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'model', label: 'Model', type: 'text', placeholder: 'Enter Model', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'yearOfPurchase', label: 'Year of Purchase', type: 'text', placeholder: 'Enter year of purchase', pattern: /^[0-9]{4}$/, maxLength: 4 },
        { name: 'type', label: 'Type', type: 'select', placeholder: "Please choose type", options: [{ value: 'Manual', label: 'Manual' }, { value: 'Automatic', label: 'Automatic' }, { value: 'Others', label: 'Others' }] },
        { name: 'max_diameter_in_mm', label: 'Max Diameter', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'max_square_in_mm', label: 'Max Square', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'bundling_possible', label: 'Bundling Possible', type: 'select', placeholder: "Please choose type", options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }] },
        { name: 'cutting_speed', label: 'Cutting Speed', type: 'text', placeholder: "Enter in Strokes/min", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'machineHourRate', label: 'Machine Hour Rate', type: 'text', placeholder: "Enter machine hour rate in Rupees", pattern: /^((?:[1-9]\d{0,4}|\d{1,5}\.\d{1,2})|\.\d{1,2})$/, maxLength: 8 },
        { name: 'noOfMachines', label: 'No. Of Machines', type: 'text', placeholder: "Enter no. of machine", pattern: /^(?:[1-9]\d{0,2})$/, maxLength: 3 },
    ],
    CircularSaw: [
        { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Enter Brand', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'model', label: 'Model', type: 'text', placeholder: 'Enter Model', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'yearOfPurchase', label: 'Year of Purchase', type: 'text', placeholder: 'Enter year of purchase', pattern: /^[0-9]{4}$/, maxLength: 4 },
        { name: 'type', label: 'Type', type: 'select', placeholder: "Please choose type", options: [{ value: 'Manual', label: 'Manual' }, { value: 'Automatic', label: 'Automatic' }, { value: 'Others', label: 'Others' }] },
        { name: 'max_diameter_round_in_mm', label: 'Max Diameter Round', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'max_square_in_mm', label: 'Max Square', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'cutting_speed_in_mmin', label: 'Cutting Speed', type: 'text', placeholder: "Enter in m/min", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'machineHourRate', label: 'Machine Hour Rate', type: 'text', placeholder: "Enter machine hour rate in Rupees", pattern: /^((?:[1-9]\d{0,4}|\d{1,5}\.\d{1,2})|\.\d{1,2})$/, maxLength: 8 },
        { name: 'noOfMachines', label: 'No. Of Machines', type: 'text', placeholder: "Enter no. of machine", pattern: /^(?:[1-9]\d{0,2})$/, maxLength: 3 },
    ],
}