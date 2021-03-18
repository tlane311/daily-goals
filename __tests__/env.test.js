import dotenv from 'dotenv';
dotenv.config();


describe('env', () => {
    it('should have a PORT', () => {
        expect(process.env.PORT).toBeDefined();
    });
    it('should define secret', () => {
        expect(process.env.SECRET).toBeDefined();
    });
    it('should define USER', () => {
        expect(process.env.USER).toBeDefined();
    });
    it('should define PASSWORD', () => {
        expect(process.env.PASSWORD).toBeDefined();
    });
    it('should define HOST', () => {
        expect(process.env.HOST).toBeDefined();
    });
    it('should define DATABASE', () => {
        expect(process.env.DATABASE).toBeDefined();
    });
    
});