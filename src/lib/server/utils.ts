import fs from 'node:fs';


export async function save_json(path: string, value: any) {
    await fs.promises.writeFile(path, JSON.stringify(value, null, 2), { encoding: 'utf-8' });
}

export async function read_json(path: string) {
    return JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' }));
}
