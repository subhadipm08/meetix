// Email validation using a comprehensive regex
export const validateEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

// Password validation (min 6 characters)
export const validatePassword = (password) => {
    if (!password) return false;
    return password.length >= 6;
};

// Username validation (3-20 characters, alphanumeric and underscores)
export const validateUsername = (username) => {
    if (!username) return false;
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
};

// Gender validation
export const validateGender = (gender) => {
    const validGenders = ['male', 'female', 'other'];
    return validGenders.includes(gender);
};
