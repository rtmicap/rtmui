export const Milling = {
    ConventionalMillingMachine: [
        { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Enter Brand', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'type', label: 'Type', type: 'select', placeholder: "Please choose type", options: [{ value: 'Horizontal', label: 'Horizontal' }, { value: 'Vertical', label: 'Vertical' }] },
        { name: 'model', label: 'Model', type: 'text', placeholder: 'Enter Model', pattern: /^[a-zA-Z0-9-\s]*$/, maxLength: 50 },
        { name: 'yearOfPurchase', label: 'Year of Purchase', type: 'text', placeholder: 'Enter year of purchase', pattern: /^[0-9]{4}$/, maxLength: 4 },
        { name: 'table_size_in_mm', label: 'Table Size', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'no_of_t_slots', label: 'No of T slots', type: 'text', placeholder: "Enter in number", pattern: /^[0-9]{0,4}$/, maxLength: 4 },
        { name: 'swivel_of_table', label: 'Swivel of Table', type: 'text', placeholder: "Enter in degrees", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'standard_arbor_size', label: 'Standard Arbor Size', type: 'text', placeholder: "Enter in inches", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'longitudinal_travel', label: 'Longitudinal Travel', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'vertical_travel', label: 'Vertical Travel', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'cross_travel', label: 'Cross Travel', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'quill_spindle_dia_in_mm', label: 'Quill Spindle Dia', type: 'text', placeholder: "Dimension in mm", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },
        { name: 'type_of_feed', label: 'Type Of Feed', type: 'select', placeholder: "Please choose type", options: [{ value: 'Manual', label: 'Manual' }, { value: 'Automated', label: 'Automated' }] },
        { name: 'ppk', label: 'PPK', type: 'text', placeholder: "Enter in number", pattern: /^(?:\d{1,4}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 7 },

        { name: 'machineHourRate', label: 'Machine Hour Rate', type: 'text', placeholder: "Enter machine hour rate in Rupees", pattern: /^(?:\d{1,5}(?:\.\d{1,2})?|\.\d{1,2})$/, maxLength: 8 },
        { name: ' F', label: 'No. Of Machines', type: 'text', placeholder: "Enter no. of machine", pattern: /^\d{1,3}$/,maxLength: 3},
    ]
}