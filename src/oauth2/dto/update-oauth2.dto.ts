import { PartialType } from '@nestjs/swagger';
import { CreateOauth2Dto } from './create-oauth2.dto';

export class UpdateOauth2Dto extends PartialType(CreateOauth2Dto) {}
