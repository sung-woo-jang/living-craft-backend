import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Icon } from './entities/icon.entity';
import { IconType } from './enums/icon-type.enum';
import { IconListDto } from './dto/response/icon-list.dto';

@Injectable()
export class IconsService {
  constructor(
    @InjectRepository(Icon)
    private readonly iconRepository: Repository<Icon>,
  ) {}

  /**
   * 아이콘 목록 조회
   * @param type 아이콘 타입 필터 (선택)
   * @param search 아이콘 이름 검색 (선택)
   * @param limit 최대 결과 개수 (기본: 100, 최대: 500)
   */
  async findAll(
    type?: IconType,
    search?: string,
    limit?: number,
  ): Promise<IconListDto[]> {
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    // limit 검증 (기본: 100, 최대: 500)
    const take = Math.min(limit || 100, 500);

    const icons = await this.iconRepository.find({
      where,
      order: { name: 'ASC' },
      take,
    });

    return icons.map((icon) => ({
      id: icon.id,
      name: icon.name,
      type: icon.type,
    }));
  }

  /**
   * ID로 아이콘 조회
   * @param id 아이콘 ID
   */
  async findById(id: number): Promise<Icon | null> {
    return this.iconRepository.findOne({ where: { id } });
  }
}
