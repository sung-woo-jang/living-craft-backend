import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService, UpdateUserData } from './users.service';
import { UserResponseDto } from './dto/response/user-response.dto';
import {
  SuccessBaseResponseDto,
  PaginatedResponseDto,
} from '@common/dto/response/success-base-response.dto';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@common/enums';
import { PhoneUtil } from '@common/utils/phone.util';

@ApiTags('사용자')
@Controller('users')
@SwaggerBaseApply()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인된 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    type: SuccessBaseResponseDto<UserResponseDto>,
  })
  async getMyProfile(
    @CurrentUser() user: any,
  ): Promise<SuccessBaseResponseDto<UserResponseDto>> {
    const userData = await this.usersService.findById(user.sub);

    // 전화번호 마스킹
    const maskedUser = {
      ...userData,
      phone: PhoneUtil.mask(userData.phone),
    };
    const responseData = UserResponseDto.fromEntity(maskedUser);

    return new SuccessBaseResponseDto(
      '사용자 정보를 조회했습니다.',
      responseData,
    );
  }

  @Put('me')
  @ApiOperation({
    summary: '내 정보 수정',
    description: '현재 로그인된 사용자의 정보를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 수정 성공',
    type: SuccessBaseResponseDto<UserResponseDto>,
  })
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateData: UpdateUserData,
  ): Promise<SuccessBaseResponseDto<UserResponseDto>> {
    const updatedUser = await this.usersService.update(user.sub, updateData);

    const maskedUser = {
      ...updatedUser,
      phone: PhoneUtil.mask(updatedUser.phone),
    };
    const responseData = UserResponseDto.fromEntity(maskedUser);

    return new SuccessBaseResponseDto(
      '사용자 정보를 수정했습니다.',
      responseData,
    );
  }

  @Get('customers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '고객 목록 조회 (관리자)',
    description: '모든 고객의 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '고객 목록 조회 성공',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  async getCustomers(
    @Query() paginationDto: PaginationRequestDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { users, meta } =
      await this.usersService.findCustomers(paginationDto);

    const responseData = users.map((user) => UserResponseDto.fromEntity(user));

    return new PaginatedResponseDto(
      '고객 목록을 조회했습니다.',
      responseData,
      meta,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '사용자 상세 조회 (관리자)',
    description: '특정 사용자의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 상세 조회 성공',
    type: SuccessBaseResponseDto<UserResponseDto>,
  })
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<UserResponseDto>> {
    const user = await this.usersService.findById(id);
    const responseData = UserResponseDto.fromEntity(user);

    return new SuccessBaseResponseDto(
      '사용자 정보를 조회했습니다.',
      responseData,
    );
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '사용자 정보 수정 (관리자)',
    description: '특정 사용자의 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 수정 성공',
    type: SuccessBaseResponseDto<UserResponseDto>,
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateUserData,
  ): Promise<SuccessBaseResponseDto<UserResponseDto>> {
    const updatedUser = await this.usersService.update(id, updateData);
    const responseData = UserResponseDto.fromEntity(updatedUser);

    return new SuccessBaseResponseDto(
      '사용자 정보를 수정했습니다.',
      responseData,
    );
  }

  @Put(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '사용자 비활성화 (관리자)',
    description: '특정 사용자를 비활성화합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 비활성화 성공',
    type: SuccessBaseResponseDto<UserResponseDto>,
  })
  async deactivateUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<UserResponseDto>> {
    const user = await this.usersService.deactivate(id);
    const responseData = UserResponseDto.fromEntity(user);

    return new SuccessBaseResponseDto(
      '사용자를 비활성화했습니다.',
      responseData,
    );
  }

  @Put(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '사용자 활성화 (관리자)',
    description: '특정 사용자를 활성화합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 활성화 성공',
    type: SuccessBaseResponseDto<UserResponseDto>,
  })
  async activateUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<UserResponseDto>> {
    const user = await this.usersService.activate(id);
    const responseData = UserResponseDto.fromEntity(user);

    return new SuccessBaseResponseDto('사용자를 활성화했습니다.', responseData);
  }
}
