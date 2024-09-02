import { catchP } from '@helpers/catch'
import { FastifyPluginAsync } from 'fastify'

interface Service {
  health?: () => Promise<boolean>
}

interface HealthOptions {
  services: Service[]
}

/** 服务健康检查，符合 k8s 健康检查要求 */
// 非 200 的返回统一被认为不健康
export function createHealthRouter(options: HealthOptions): FastifyPluginAsync {
  async function checkHealth(services: Service[]) {
    for (let index = 0; index < services.length; index++) {
      const service = services[index]
      if (service.health) {
        const [status, error] = await catchP(service.health())
        if (error != null) return false
        if (status != true) return false
      }
    }
    return true
  }

  return async (app) => {
    // healthz 是 k8s 的默认健康检查接口
    app.all('/healthz', async (request, reply) => {
      const { services } = options
      const ok = await checkHealth(services)
      reply.code(ok ? 200 : 500).send('done')
    })

    // healthz 好像不是正确的拼写，这个为了正确的拼写...
    app.all('/health', async (request, reply) => {
      const { services } = options
      const ok = await checkHealth(services)
      reply.code(ok ? 200 : 500).send('done')
    })
  }
}
