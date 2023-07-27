import DataLoader from "dataloader";
import { User } from "../entities/User";
import { In } from "typeorm";

// keys:  [1, 78, 8, 9]              input
// users: [{id: 1, user: "tim"}, {id: 78, user: "john"}, {}, {}]           return 
export const createUserLoader = () => new DataLoader<number, User>(async (userIds) => {
    const users = await User.findBy({ id: In(userIds as number[])})

    // "Record" utility type is, where K is any union like ["field1" | "field2"] or [string | number] or just [number]:
    // 
    //   type Record<K extends keyof any, T> = {
    //     [P in K]: T;
    //   };
    
    const userIdToUser: Record<number, User> = {};  // means object with props beeing "number" and values being "User"

    users.forEach(u => {
        userIdToUser[u.id] = u;
    })

    return userIds.map(userId => userIdToUser[userId]);
});