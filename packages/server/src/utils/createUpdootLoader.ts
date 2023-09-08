import DataLoader from "dataloader";
import { User } from "../entities/User";
import { In } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { AppDataSource } from "../app-data-source";

// [{postId: 5, userId:10}]
// {postId: 5, userId:10, value: 1}
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const values: Record<string, number> = {};
      let whereInList = "";
      let first = true;
      let indx = 1;

      for (const { postId, userId } of keys) {
        const pidName = `pid${indx}`;
        const uidName = `uid${indx}`;

        values[pidName] = postId;
        values[uidName] = userId;

        if (!first) {
          whereInList += ", ";
        } else {
          first = false;
        }

        whereInList += `(:${pidName}, :${uidName})`;
        indx++;
      }

    //   console.log("values: ", values);
    //   console.log("whereInList: ", whereInList);

      const updoots = await AppDataSource.createQueryBuilder()
        .select("updoot")
        .from(Updoot, "updoot")
        .where(`("postId", "userId") IN (${whereInList})`, values)
        .getMany();

      // "Record" utility type is, where K is any union like ["field1" | "field2"] or [string | number] or just [number]:
      //
      //   type Record<K extends keyof any, T> = {
      //     [P in K]: T;
      //   };

      const updootIdsToUpdoots: Record<string, Updoot> = {}; // means object with props beeing "number" and values being "User"

      updoots.forEach((updoot) => {
        updootIdsToUpdoots[`${updoot.postId}|${updoot.userId}`] = updoot;
      });

      return keys.map(
        (updoot) => updootIdsToUpdoots[`${updoot.postId}|${updoot.userId}`]
      );
    }
  );
