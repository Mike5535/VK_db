export const validateColumn = (column) => {
    return {
        name: column,
        skip: function() { return !this[column]}
    };
};

export const isId = (value) => {
    if ( /^\d+$/.test(value)){
        return true
    }
    return false
};

export const convertToSlug = (str) => {
    return str
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
};
