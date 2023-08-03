import {User, DatabaseInstance, userSchema} from '@/db';
export default defineEventHandler(async (event) => {

    const userToSave = (await readBody(event)) satisfies User;

    const created = DatabaseInstance.getDBInstance().insert(userSchema).values(userToSave).returning();
    console.log(created);

    
  });