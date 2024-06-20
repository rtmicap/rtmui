import moment from 'moment/moment';

export const formatUpperCase = (text) => {
    return text.toUpperCase();
}

export const formattedDateTime = (data) => {
    return moment(data).format('MMMM Do YYYY, h:mm a');
}