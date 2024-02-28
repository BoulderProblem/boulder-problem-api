export function assert(value, message) {
    if (!value) {
        throw new Error(message ?? 'value is falsy');
    }
}
//# sourceMappingURL=utils.js.map