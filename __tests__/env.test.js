import dotenv from 'dotenv';
dotenv.config();


describe('env', () => {
    it('should define secret', () => {
        expect(process.env.SECRET).toBeDefined();
    });
    it('should define serverport', () => {
        expect(process.env.SERVERPORT).toBeDefined();
    })
    it('should define DBUSER', () => {
        expect(process.env.DBUSER).toBeDefined();
    });
    it('should define DBPASSWORD', () => {
        expect(process.env.DBPASSWORD).toBeDefined();
    });
    it('should define DBHOST', () => {
        expect(process.env.DBHOST).toBeDefined();
    });

    it('should define DATABASE', () => {
        expect(process.env.DATABASE).toBeDefined();
    });
    
});