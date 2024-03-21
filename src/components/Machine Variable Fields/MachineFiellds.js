export const machineFields = {
    Cutting: {
        BandSaw: [
            { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Enter Brand' },
            { name: 'model', label: 'Model', type: 'text', placeholder: 'Enter Model' },
            { name: 'yearOfPurchase', label: 'Year of Purchase', type: 'text', placeholder: 'Enter year of purchase' },
            { name: 'max_diameter_round_in_mm', label: 'Max Diameter Round', type: 'text', placeholder: "Dimension in mm" },
            { name: 'min_diameter_round_in_mm', label: 'Min Diameter Round', type: 'text', placeholder: "Dimension in mm" },
            { name: 'min_square_in_mm', label: 'Min Square', type: 'text', placeholder: "Dimension in mm" },
            { name: 'max_square_in_mm', label: 'Max Square', type: 'text', placeholder: "Dimension in mm" },
            { name: 'min_cut_feed_length_in_mm', label: 'Min Cut Feed Length', type: 'text', placeholder: "Dimension in mm" },
            { name: 'max_cut_feed_length_in_mm', label: 'Max Cut Feed Length', type: 'text', placeholder: "Dimension in mm" },
            { name: 'cutter_motor_power_in_kw', label: 'Cutter Motor Power', type: 'text', placeholder: "Enter in Kw" },
            { name: 'cutting_speed_in_mmin', label: 'Cutting Speed', type: 'text', placeholder: "Enter in m/min" },
            { name: 'type', label: 'Type', type: 'select', placeholder: "Please choose type", options: ['Manual', 'Automatic'] },
            { name: 'machineHourRate', label: 'Machine Hour Rate', type: 'text', placeholder: "Enter machine hour rate" },
            { name: 'noOfMachines', label: 'No. Of Machines', type: 'text', placeholder: "Enter no. of machine" },
            // { name: 'identical', label: 'Yes', type: 'checkbox' },
        ],
    },
    // apparel: {
    //     menShirts: [
    //         { name: 'size', label: 'Size', type: 'select', options: ['S', 'M', 'L', 'XL'] },
    //         { name: 'color', label: 'Color', type: 'text' },
    //         // Add more fields as needed
    //     ],
    //     womenDresses: [
    //         { name: 'size', label: 'Size', type: 'select', options: ['S', 'M', 'L', 'XL'] },
    //         { name: 'style', label: 'Style', type: 'text' },
    //         // Add more fields as needed
    //     ],
    // }
}
