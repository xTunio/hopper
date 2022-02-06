import { logger } from '../logger';

//TODO: make it in global scope, because it's useless atm
export default async function useval(args: string[]) {
        const code = args.join(' ')
        try{
            let evaledOutput = eval(code);
            logger.eval(evaledOutput);
        } catch (e) {
            console.error(e);
        }
}