import { ApiResponse } from "@/infra/interface/response";
import { CrewMember } from "../domain/movie";

export interface CrewMemberRepository {
  getAllCrewMembers(): Promise<ApiResponse<CrewMember[]>>;
  searchCrewMembers(query: string): Promise<ApiResponse<CrewMember[]>>;
  getCrewMemberById(id: string): Promise<ApiResponse<CrewMember>>;
  createCrewMember(formData: FormData): Promise<ApiResponse<CrewMember>>;
  updateCrewMember(
    id: string,
    formData: FormData,
  ): Promise<ApiResponse<CrewMember>>;
  deleteCrewMember(id: string): Promise<ApiResponse<void>>;
}
